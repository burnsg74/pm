import {chromium} from "@playwright/test";
import {execSync} from 'child_process';
import dotenv from "dotenv";
import fs from "fs";
import sqlite3 from "sqlite3";

sqlite3.verbose();
dotenv.config({ path: `.env.${process.env.NODE_ENV ?? 'development'}` });

// --- Constants ---
// const SEARCH_TERMS = ["Web Developer"];
const SEARCH_TERMS = ["Backend Developer", "Frontend Developer", "PHP Developer", "Senior Full Stack Engineer", "Senior Full Stack Developer", "Web Developer"];
const SKILLS_KNOWN = ["HTML", "JavaScript", "CSS", "NoSQL", "SQL", "React", "Vue", "Node.js", "Node", "Python", "PHP", "Git", "AWS", "TypeScript", "Svelte", "Flutter", "Django", "Laravel", "jQuery", "SCSS", "Jest", "Cypress", "MySQL", "Javascript", "CI/CD", "Jira", "DynamoDB", "Linux", "Vuex",].map(escapeRegExp);
const SKILLS_UNKNOWN = ["MS SQL", "Ruby on Rails", "Ruby", "Azure", ".Net", "Java", "C#", "C++", "Swift", "Kotlin", "Angular", "Flutter", "Spring", "MSSQL", "Next.js", "ASP.NET", "VB.Net", "VB", "PostgreSQL", "Wordpress", "Drupal", "Visual Basic",].map(escapeRegExp);
const FROM_AGE = '1'; // last, 1, 3
const VERIFICATION_TEXT = "Additional Verification Required";
const EXPIRED_TEXT = "This job has expired on Indeed";
const NEXT_PAGE_SELECTOR = 'a[data-testid="pagination-page-next"]';
const JOB_CACHE_FILE = 'cache/jobsCache.json';
const PAUSE_IN_MS = 35000;

const databaseConnection = createDatabaseConnection(process.env.DB_FILE);
const existingJob = await fetchJobsFromDB(databaseConnection);
const browser = await openChrome();
const browsersFirstTab = BrowsersFirstTab(browser);

// --- Start of Script ---
let newJobList = loadCache();
console.log("Loaded Cache:", newJobList.length, "jobs.");

// Get each Job IDs from Indeed for each search term
for (const SEARCH_TERM of SEARCH_TERMS) {
    console.log(`Processing jobs for search term: "${SEARCH_TERM}"`);
    const url = `https://www.indeed.com/jobs?q=${encodeURIComponent(SEARCH_TERM)}&l=Remote&fromage=${FROM_AGE}`;
    await browsersFirstTab.goto(url);

    let pageNumber = 0;
    while (true) {
        pageNumber++;
        console.log("Page Number:", pageNumber);
        await pauseInMs(PAUSE_IN_MS);
        await verificationRequiredCheck(browsersFirstTab);
        await simulateUserWindowScroll(browsersFirstTab);
        const pageJobList = await getPageJobList(browsersFirstTab);
        updateNewJobList(pageJobList, SEARCH_TERM);
        if (!(await clickNextPageLink(browsersFirstTab))) {
            break;
        }
    }
}

console.log("New Jobs Found:", newJobList.length);
console.log("Get each Job Details, and save to DB...");
const INSERT_QUERY = `
    INSERT INTO jobs (source, jk, title, company, search_query, salary_min, salary_max, link, post_html, status,
                      date_posted, date_new, skills_known, skills_unknown)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
const preparedStatement = databaseConnection.prepare(INSERT_QUERY);



for (const newJob of newJobList) {
    console.log("Getting Job Details for:", newJob.jk);
    const URL = newJob.link;
    await browsersFirstTab.goto(URL);
    await pauseInMs(PAUSE_IN_MS);
    await verificationRequiredCheck(browsersFirstTab);
    if (await isExpired(browsersFirstTab, newJob)) continue;

    // @TODO: Check if already applied

    // A JSON-based Serialization for Linked Data (https://www.w3.org/TR/2014/REC-json-ld-20140116)
    const scriptTag = await browsersFirstTab.$('script[type="application/ld+json"]');
    if (!scriptTag) continue;
    const jsonContent = await scriptTag.evaluate((el) => el.textContent.trim());
    const jsonData = JSON.parse(jsonContent);

    let newDBRecord = {
        source: "Indeed",
        jk: newJob.jk,
        title: jsonData.title,
        company: jsonData.hiringOrganization.name,
        search_query: newJob.search_query,
        salary_min: jsonData.baseSalary?.value?.minValue || null,
        salary_max: jsonData.baseSalary?.value?.maxValue || null,
        link: newJob.link,
        post_html: jsonData.description.replace(/\n/g, '').trim(),
        status: "New",
        date_posted: jsonData.datePosted,
        date_new: new Date().toISOString(),
        skills_known: "",
        skills_unknown: "",
    }

    newDBRecord.post_html = highlightWords(newDBRecord.post_html);
    newDBRecord.skills_known = getSkills(newDBRecord.post_html, SKILLS_KNOWN);
    newDBRecord.skills_unknown = getSkills(newDBRecord.post_html, SKILLS_UNKNOWN);

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

}
preparedStatement.finalize();

// Cleanup
fs.unlinkSync(JOB_CACHE_FILE);
await browser.close();
databaseConnection.close();
console.log("All Done. Exiting...");
// --- End of Script ---

// --- Functions ---
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
                   FROM jobs`;
    return new Promise((resolve, reject) => {
        db.all(query, [], (err, rows) => {
            if (err) {
                reject(err);
            }
            resolve(rows);
        });
    });
}

async function openChrome() {
    execSync('open -a "Google Chrome" --args --remote-debugging-port=9222 https://www.indeed.com');
    console.log("Waiting for Chrome to launch...");
    await new Promise(resolve => setTimeout(resolve, 5000));
    return await chromium.connectOverCDP('http://127.0.0.1:9222');
}

async function pauseInMs(pauseInMs) {
    console.log("Pausing...");
    await new Promise((resolve) => setTimeout(resolve, Math.floor(Math.random() * pauseInMs + 1000)),);
}

async function verificationRequiredCheck(page) {
    if (await page.evaluate((text) => document.body.innerText.includes(text), VERIFICATION_TEXT)) {
        console.log('!! ' + VERIFICATION_TEXT);
        await browser.close();
        process.exit(1);
    }
}

async function isExpired(page, newJob) {
    if (await page.evaluate((text) => document.body.innerText.includes(text), EXPIRED_TEXT)) {
        console.log('!! ' + EXPIRED_TEXT);
        removeJobFromCache(newJob.jk);
        return true;
    }

    return false;
}

async function simulateUserWindowScroll(page) {
    await page.evaluate(() => window.scrollBy(0, window.innerHeight));
}

function BrowsersFirstTab(browser) {
    return browser.contexts()[0].pages()[0];
}

async function getPageJobList(page) {
    return await page.evaluate(async () => {
        const jobCardsDiv = document.getElementById("mosaic-provider-jobcards");
        if (!jobCardsDiv) {
            console.log("Job cards division not found on this page.");
            return [];
        }

        const jobCardsLinks = jobCardsDiv.querySelectorAll("a.jcs-JobTitle");
        const pageJobList = [];
        for (const aElement of Array.from(jobCardsLinks)) {
            const jk = aElement.getAttribute("data-jk");
            const href = "https://www.indeed.com" + aElement.getAttribute("href");
            pageJobList.push({jk, href});
        }

        console.log("Jobs on page:", pageJobList.length);
        return pageJobList;
    });
}

function updateNewJobList(pageJobList, searchTerm) {
    let pageStats = {
        total: pageJobList.length, new: 0, updated: 0, exciting: 0, unChanged: 0,
    };
    pageJobList.forEach(pageJob => {
        const excitingJob = existingJob.find(job => job.jk === pageJob.jk);
        if (excitingJob) {
            pageStats.exciting++;
            return;
        }

        const repeatedJob = newJobList.find(job => job.jk === pageJob.jk);
        if (!repeatedJob) {
            newJobList.push({jk: pageJob.jk, link: pageJob.href, search_query: searchTerm});
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

async function clickNextPageLink(page) {
    const nextPageLink = await page.$(NEXT_PAGE_SELECTOR);
    if (!nextPageLink) {
        return false;
    }
    await nextPageLink.click();
    return true;
}

// Load Cache
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

// Save Cache
function saveCache(data) {
    try {
        const dir = JOB_CACHE_FILE.substring(0, JOB_CACHE_FILE.lastIndexOf('/'));
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, {recursive: true});
        }
        fs.writeFileSync(JOB_CACHE_FILE, JSON.stringify(data, null, 2), 'utf8');
        console.log("Cache updated successfully.");
    } catch (error) {
        console.error("Error writing to cache file:", error);
    }
}

function removeJobFromCache(jk) {
    newJobList = newJobList.filter(job => job.jk !== jk);
    saveCache(newJobList);
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]#\\]/g, "\\$&");
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

function getSkills(text,skills) {
    if (!text) return "";

    const regex = new RegExp(`(?<!\\w)(${skills.join("|")})(?!\\w)`, "gi");
    const foundSkills = new Set();
    let match;
    while ((match = regex.exec(text)) !== null) {
        foundSkills.add(match[0]);
    }
    return Array.from(foundSkills).join(", ");
}


