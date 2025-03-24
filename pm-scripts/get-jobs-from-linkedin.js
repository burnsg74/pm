import {chromium} from "@playwright/test";
import {execSync} from 'child_process';
import dotenv from "dotenv";
import fs from "fs";
import sqlite3 from "sqlite3";

sqlite3.verbose();
dotenv.config({path: `.env.${process.env.NODE_ENV ?? 'development'}`});

// --- Constants ---
// const SEARCH_TERMS = ["PHP Developer"];
const SEARCH_TERMS = ["Backend Developer", "Frontend Developer", "PHP Developer", "Senior Full Stack Engineer", "Senior Full Stack Developer", "Web Developer"];
const SKILLS_KNOWN = ["HTML", "JavaScript", "CSS", "NoSQL", "SQL", "React", "Vue", "Node.js", "Node", "Python", "PHP", "Git", "AWS", "TypeScript", "Svelte", "Flutter", "Django", "Laravel", "jQuery", "SCSS", "Jest", "Cypress", "MySQL", "Javascript", "CI/CD", "Jira", "DynamoDB", "Linux", "Vuex", "Redis", "PostgreSQL"].map(escapeRegExp);
const SKILLS_UNKNOWN = [".Net", "ASP.NET", "C#", "C++", "Drupal", "Flutter", "Golang", "Kotlin", "MS SQL", "MSSQL", "Next.js", "Spring", "Swift", "VB", "VB.Net", "Visual Basic", "Wordpress"].map(escapeRegExp);
const FROM_AGE = '14400'; // in Seconds 86400 = 1 day, 14400 = 4 hours
const JOB_CACHE_FILE = 'cache/jobsCacheLinkedin.json';
const PAUSE_IN_MS = 35000;
const BASE_URL = 'https://www.linkedin.com/jobs/search/';
const DEFAULT_SORT = 'DD';

console.log("Step 1: Open Chrome Browser in Remote Debugging Mode");
const databaseConnection = createDatabaseConnection(process.env.DB_FILE);
const browser = await openChrome();
const browsersFirstTab = BrowsersFirstTab(browser);
let newCacheList = [];

// --- Start of Script ---
console.log("Step 2: Get each Job IDs from DB and Cache");
// @TODO DELETE FROM jobs WHERE status = 'Deleted';
const existingJob = await fetchJobsFromDB(databaseConnection);
console.log("existing Job:", existingJob.length, "jobs.");

let newJobList = loadCache();
console.log("Loaded Cache:", newJobList.length, "jobs.");

// Get each Job IDs for each search term
console.log("Step 3: Get each Job IDs for each search term");
for (const SEARCH_TERM of SEARCH_TERMS) {
    console.log(`Processing jobs for search term: "${SEARCH_TERM}"`);

    const url = buildLinkedInJobsUrl(SEARCH_TERM, FROM_AGE);
    console.log(`Navigating to job Search`, url);
    await browsersFirstTab.goto(url);

    let pageNumber = 0;
    while (true) {
        pageNumber++;
        console.log(SEARCH_TERM, ": Page Number:", pageNumber);
        await pauseInMs(PAUSE_IN_MS);
        let pageJobList = await browsersFirstTab.$$eval(
            '[data-job-id]',
            elements => elements.map(element => element.getAttribute('data-job-id'))
        );

        console.log("Page Job List:", pageJobList.length);
        updateNewJobList(pageJobList, SEARCH_TERM);
        if (!(await clickNextPageLink(browsersFirstTab))) {
            break;
        }
    }
}
console.log("New Jobs Found:", newJobList.length);

newCacheList = [...newJobList];
console.log("Step 4: Get each Job Details, and save to DB...");
const INSERT_QUERY = `INSERT INTO jobs (source, jk, title, company, search_query, salary_min, salary_max, link,
                                        post_html, status, date_posted, date_new, skills_known, skills_unknown)
                      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
const preparedStatement = databaseConnection.prepare(INSERT_QUERY);

console.log("Saving Jobs to DB...");
let i = 0;
for (let newJob of newJobList) {
    let jobUrl = `https://www.linkedin.com/jobs/view/${newJob.jk}`;

    console.log("\n----------------------------------------");
    console.log(++i, "of", newJobList.length, ":", newJob.jk);
    console.log("Navigating to job:", jobUrl);
    await browsersFirstTab.goto(jobUrl);
    await pauseInMs(PAUSE_IN_MS);

    let newDBRecord = {
        source: "LinkedIn",
        jk: newJob.jk,
        title: '',
        company: '',
        search_query: newJob.search_query,
        salary_min: '',
        salary_max: '',
        link: `https://www.linkedin.com/jobs/view/${newJob.jk}`,
        post_html: 'Not Found',
        status: "New",
        date_posted: '',
        date_new: new Date().toISOString(),
        skills_known: "",
        skills_unknown: "",
    }

    const htmlCodeElements = await browsersFirstTab.$$('code');
    for (const htmlCodeElement of htmlCodeElements) {
        try {
            let json = JSON.parse(await htmlCodeElement.innerText());
            if (json?.data?.title) {
                newDBRecord.title = json.data.title;
            }

            // if (json?.data?.description?.text) {
            //     newDBRecord.post_html = json.data.description.text;
            // }

            if (json?.data?.listedAt) {
                newDBRecord.date_posted = new Date(json.data.listedAt).toISOString();
            }

            if (json?.included[1]?.name) {
                newDBRecord.company = json.included[1].name;
            }

            if (json?.included[3]?.jobInsightsV2ResolutionResults[0]?.jobInsightViewModel?.description[0]?.label?.text?.text) {
                newDBRecord.salary_min = json.included[3].jobInsightsV2ResolutionResults[0].jobInsightViewModel.description[0].label.text.text;
            }

            if (json?.included[3]?.tertiaryDescription?.text) {
                newDBRecord.salary_max = json.included[3].tertiaryDescription.text;
            }
        } catch (error) {
            // console.warn("Invalid JSON: Skipping this element");
        }
    }
    async function getArticleHTML(page) {
        return page.evaluate(() => {
            const articleElement = document.querySelector('article');
            return articleElement ? articleElement.outerHTML : null;
        });
    }

    newDBRecord.post_html = await getArticleHTML(browsersFirstTab);
    newDBRecord.post_html = highlightWords(newDBRecord.post_html);
    newDBRecord.skills_known = getSkills(newDBRecord.post_html, SKILLS_KNOWN);
    newDBRecord.skills_unknown = getSkills(newDBRecord.post_html, SKILLS_UNKNOWN);

    if (newDBRecord.skills_known.length === 0 || newDBRecord.skills_unknown.length > 0) {
        console.log("😔 Skipping Job", newDBRecord.skills_unknown.length, newDBRecord.skills_unknown);
        continue;
    }

    preparedStatement.run([
        newDBRecord.source,
        newDBRecord.jk,
        newDBRecord.title,
        newDBRecord.company,
        newDBRecord.search_query,
        newDBRecord.salary_min,
        newDBRecord.salary_max,
        newDBRecord.link,
        newDBRecord.post_html,
        newDBRecord.status,
        newDBRecord.date_posted,
        newDBRecord.date_new,
        newDBRecord.skills_known,
        newDBRecord.skills_unknown,
    ], function (err) {
        if (err) {
            console.error("Error inserting into the database:", err);
            return;
        }
        console.log("Inserted record ID:", this.lastID);
        removeJobFromCache(newJob.jk);
    });
    console.log("💾 Saved Job:", newDBRecord.jk);
}
preparedStatement.finalize();
console.log("All Jobs Saved to DB.");

// Cleanup
fs.unlinkSync(JOB_CACHE_FILE);
await browser.close();
databaseConnection.close();
console.log("All Done. Exiting...");
// --- End of Script ---

// ----------------- Helper Functions -----------------
async function openChrome() {
    // const profile = "_Home_";
    const profile = "Profile 1";
    const url = "https://www.linkedin.com/jobs";
    const remoteDebuggingPort = 9222;

    execSync(`open -na "Google Chrome" --args --remote-debugging-port=${remoteDebuggingPort} --profile-directory="${profile}" ${url}`);
    console.log("Waiting for Chrome to launch...");
    await new Promise(resolve => setTimeout(resolve, 10000));

    return await chromium.connectOverCDP(`http://127.0.0.1:${remoteDebuggingPort}`);
}

function BrowsersFirstTab(browser) {
    return browser.contexts()[0].pages()[0];
}

async function pauseInMs(pauseInMs) {
    console.log("⏱️ Pause");
    await new Promise((resolve) => setTimeout(resolve, Math.floor(Math.random() * pauseInMs + 1000)),);
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]#\\]/g, "\\$&");
}

function loadCache() {
    if (fs.existsSync(JOB_CACHE_FILE)) {
        try {
            const data = fs.readFileSync(JOB_CACHE_FILE, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error("Error reading cache file:", error);
            return [];
        }
    } else {
        console.log("Cache file does not exist. Starting with an empty cache.");
        return [];
    }
}

function createDatabaseConnection(dbPath) {
    return new sqlite3.Database(dbPath, (err) => {
        if (err) {
            console.error("Database connection failed:", err);
            process.exit(1);
        }
    });
}

async function fetchJobsFromDB(db) {
    const query = `SELECT jk, search_query
                   FROM jobs
                   WHERE source = 'LinkedIn'`;
    return new Promise((resolve, reject) => {
        db.all(query, [], (err, rows) => {
            if (err) {
                reject(err);
            }
            resolve(rows);
        });
    });
}

function buildLinkedInJobsUrl(searchTerm, fromAge) {
    // keywords: encodeURIComponent(encodeURIComponent(searchTerm)),
    // https://www.linkedin.com/jobs/search/?currentJobId=4132972284&f_TPR=r86400&f_WT=2&geoId=103644278&keywords=PHP%20Developer&origin=JOB_SEARCH_PAGE_SEARCH_BUTTON&refresh=true&sortBy=DD
    const queryParams = new URLSearchParams({
        currentJobId: '4130198952',
        f_TPR: `r${fromAge}`,
        f_WT: '2',
        geoId: '103644278',
        keywords: searchTerm,
        origin: 'JOB_SEARCH_PAGE_JOB_FILTER',
        sortBy: DEFAULT_SORT,
        refresh: true
    });

    return `${BASE_URL}?${queryParams}`;
}

function updateNewJobList(pageJobList, searchTerm) {
    let pageStats = {
        total: pageJobList.length, new: 0, updated: 0, exciting: 0, unChanged: 0,
    };
    pageJobList.forEach(pageJob => {
        const excitingJob = existingJob.find(job => job.jk === pageJob);
        if (excitingJob) {
            pageStats.exciting++;
            return;
        }

        const repeatedJob = newJobList.find(job => job.jk === pageJob);
        if (!repeatedJob) {
            let link = `https://www.linkedin.com/jobs/view/${pageJob}`;
            newJobList.push({jk: pageJob, link: link, search_query: searchTerm});
            pageStats.new++;
            return;
        }

        if (repeatedJob.search_query.split(',').includes(searchTerm)) {
            pageStats.unChanged++;
            return;
        }

        repeatedJob.search_query += `,${searchTerm}`;

        pageStats.updated++;
        saveCache(newJobList);
    });
    console.log("Page Stats:", pageStats);
}

function saveCache(data) {
    try {
        const dir = JOB_CACHE_FILE.substring(0, JOB_CACHE_FILE.lastIndexOf('/'));
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, {recursive: true});
        }
        fs.writeFileSync(JOB_CACHE_FILE, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
        console.error("Error writing to cache file:", error);
    }
}

function removeJobFromCache(jk) {
    newCacheList = newCacheList.filter(job => job.jk !== jk);
    saveCache(newCacheList);
}

function highlightWords(text) {
    if (!text) return "";

    const regex = new RegExp(`(?<!\\w)(${SKILLS_KNOWN.join("|")})(?!\\w)|(?<!\\w)(${SKILLS_UNKNOWN.join("|")})(?!\\w)`, "gi",);
    return text.replace(regex, (match, p1, p2) => {
        if (p1) {
            return `<span class="highlight-green">${match}</span>`;
        } else if (p2) {
            return `<span class="highlight-red">${match}</span>`;
        }
        return match;
    });
}

function getSkills(text, skills) {
    if (!text) return "";

    const regex = new RegExp(`(?<!\\w)(${skills.join("|")})(?!\\w)`, "gi");
    const foundSkills = new Set();
    let match;
    while ((match = regex.exec(text)) !== null) {
        foundSkills.add(match[0]);
    }
    return Array.from(foundSkills).join(", ");
}

async function clickNextPageLink(page) {
    const nextPageExists = await page.$(`button[aria-label="View next page"]`);
    if (!nextPageExists) {
        return false;
    }
    await nextPageExists.click();
    return true;
}