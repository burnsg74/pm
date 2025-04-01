import {chromium} from "@playwright/test";
import {execSync} from 'child_process';
import dotenv from "dotenv";
import fs from "fs";
import sqlite3 from "sqlite3";

sqlite3.verbose();
dotenv.config({path: `.env.${process.env.NODE_ENV ?? 'development'}`});

// --- Constants ---
const SEARCH_TERMS = ["Backend Developer", "Frontend Developer", "PHP Developer", "Senior Full Stack Engineer", "Senior Full Stack Developer", "Web Developer"];
const SKILLS_KNOWN = ["HTML", "JavaScript", "CSS", "NoSQL", "SQL", "React", "Vue", "Node.js", "Node", "Python", "PHP", "Git", "AWS", "TypeScript", "Svelte", "Flutter", "Django", "Laravel", "jQuery", "SCSS", "Jest", "Cypress", "MySQL", "Javascript", "CI/CD", "Jira", "DynamoDB", "Linux", "Vuex", "Redis", "PostgreSQL"].map(escapeRegExp);
const SKILLS_UNKNOWN = [".Net", "ASP.NET", "C#", "C++", "Drupal", "Flutter", "Golang", "Kotlin", "MS SQL", "MSSQL", "Next.js", "Spring", "Swift", "VB", "VB.Net", "Visual Basic", "Wordpress"].map(escapeRegExp);

// const FROM_AGE = 'last'; // !Indeed removed this option, in days last
const FROM_AGE = 1; // in days last, 1, 3
const VERIFICATION_TEXT = "Additional Verification Required";
const EXPIRED_TEXT = "This job has expired on Indeed";
const NEXT_PAGE_SELECTOR = 'a[data-testid="pagination-page-next"]';
const JOB_CACHE_FILE = 'cache/jobsCacheIndeed.json';
const PAUSE_IN_MS = 20000;

const databaseConnection = createDatabaseConnection(process.env.DB_FILE);
const existingJob = await fetchJobsFromDB(databaseConnection);
const browser = await openChrome();
const browsersFirstTab = BrowsersFirstTab(browser);
let newCacheList = [];

// --- Start of Script ---
let newJobList = loadCache();
console.log("Loaded Cache:", newJobList.length, "jobs.");

// Get each Job IDs for each search term
for (const [index, SEARCH_TERM] of SEARCH_TERMS.entries()) {
    console.log(`Processing jobs for search term: "${SEARCH_TERM}" (${index + 1} of ${SEARCH_TERMS.length})`);
    const url = `https://www.indeed.com/jobs?q=${encodeURIComponent(SEARCH_TERM)}&l=Remote&fromage=${FROM_AGE}`;
    await browsersFirstTab.goto(url);
    await pauseInMs(PAUSE_IN_MS);

    // jobsearch-JobCountAndSortPane-jobCount css-1xv49jx eu4oa1w0
    const jobCountElement = await browsersFirstTab.$('.jobsearch-JobCountAndSortPane-jobCount');
    const jobCountText = jobCountElement ? await jobCountElement.textContent() : '';
    console.log(`Job Count: ${jobCountText}`);
    const jobCount = parseInt(jobCountText.replace(/[^0-9]/g, ''), 10);
    if (!jobCount || jobCount === 0) {
        console.log(`No jobs found for search term: "${SEARCH_TERM}". Skipping to next term...`);
        await pauseInMs(PAUSE_IN_MS);
        await new Promise((resolve) => setTimeout(resolve, Math.floor(Math.random() * pauseInMs + 1000)));
        continue;
    }

    let pageNumber = 0;
    while (true) {
        pageNumber++;
        console.log(SEARCH_TERM, ": Page Number:", pageNumber);
        await pauseInMs(PAUSE_IN_MS);
        while (await verificationRequiredCheck(browsersFirstTab)) {
            console.log("Verification required. Retrying...");
            await pauseInMs(3000); // Pause a bit before retrying to avoid excessive page requests.
        }
        // await verificationRequiredCheck(browsersFirstTab);
        await simulateUserWindowScroll(browsersFirstTab);
        const pageJobList = await getPageJobList(browsersFirstTab);
        updateNewJobList(pageJobList, SEARCH_TERM);
        if (!(await clickNextPageLink(browsersFirstTab))) {
            break;
        }
    }
}
console.log("New Jobs Found:", newJobList.length);

newCacheList = [...newJobList];
console.log("Get each Job Details, and save to DB...");
const INSERT_QUERY = `
    INSERT INTO jobs (source, jk, title, company, search_query, salary_min, salary_max, link, post_html, status,
                      date_posted, date_new, skills_known, skills_unknown)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

// const preparedStatement = databaseConnection.prepare(INSERT_QUERY);


function isValidJson(jsonContent) {
    try {
        JSON.parse(jsonContent);
        return true;
    } catch (error) {
        return false
    }
}

async function getSalary() {
    try {
        await browsersFirstTab.waitForSelector('#salaryInfoAndJobType', {state: 'visible', timeout: 1000});
        let salaryInfoAndJobType = await browsersFirstTab.textContent('#salaryInfoAndJobType');
        let salary_min = null;
        let salary_max = null;

        const salaryRangeMatch = salaryInfoAndJobType.match(/\$([\d,]+)\s*-\s*\$([\d,]+)/);
        if (salaryRangeMatch && salaryRangeMatch[1] && salaryRangeMatch[2]) {
            salary_min = parseInt(salaryRangeMatch[1].replace(/,/g, ''), 10); // Extract and parse the minimum salary
            salary_max = parseInt(salaryRangeMatch[2].replace(/,/g, ''), 10); // Extract and parse the maximum salary
        } else {
            const singleSalaryMatch = salaryInfoAndJobType.match(/\$([\d,]+)/);
            if (singleSalaryMatch && singleSalaryMatch[1]) {
                salary_min = parseInt(singleSalaryMatch[1].replace(/,/g, ''), 10); // Only one salary provided
            }
        }
        return {salary_min, salary_max};
    } catch (error) {
        let salary_min = 0;
        let salary_max = 0;
        return {salary_min, salary_max};
    }

}


let i = 0;
for (const newJob of newJobList) {
    console.log("\n----------------------------------------");
    console.log(++i, "of", newJobList.length, ":", newJob.jk, " - ", newJob.title);
    const URL = newJob.link;
    await browsersFirstTab.goto(URL);
    await pauseInMs(PAUSE_IN_MS);
    while (await verificationRequiredCheck(browsersFirstTab)) {
        console.log("Verification required. Retrying...");
        await pauseInMs(3000);
    }
    if (await isExpired(browsersFirstTab, newJob)) continue;

    // A JSON-based Serialization for Linked Data (https://www.w3.org/TR/2014/REC-json-ld-20140116)
    const scriptTag = await browsersFirstTab.$('script[type="application/ld+json"]');
    // console.log("scriptTag", scriptTag);
    // if (!scriptTag) {
    //     //@TODO need a backup way to get details (maybe)
    //     console.log("No JSON-LD found. Skipping...");
    //     removeJobFromCache(newJob.jk);
    //     continue;
    // }
    let jobData = {
        title: '',
        company: '',
        salary_min: 0,
        salary_max: 0,
        post_html: '',
        date_posted: null,
    }
    if (!scriptTag) {
        console.log("No JSON-LD found. Skipping...");
        removeJobFromCache(newJob.jk);
        continue;
    } else {

        const jsonContent = await scriptTag.evaluate((el) => el.textContent.trim());
        if (isValidJson(jsonContent)) {
            console.log('Data From ld+json')
            const jsonData = JSON.parse(jsonContent);
            jobData.title = jsonData.title;
            jobData.company = jsonData.hiringOrganization?.name;
            jobData.salary_min = jsonData.baseSalary?.value?.minValue || null;
            jobData.salary_max = jsonData.baseSalary?.value?.maxValue || null;
            jobData.post_html = jsonData.description.replace(/\n/g, '').trim();
        } else {
            console.log('Data from elements')
            try {
                let {salary_min, salary_max} = await getSalary();

                jobData.title = await browsersFirstTab.textContent('h1[data-testid="jobsearch-JobInfoHeader-title"]');
                jobData.company = await browsersFirstTab.textContent('div[data-testid="inlineHeader-companyName"]');
                jobData.salary_min = salary_min ?? 0;
                jobData.salary_max = salary_max ?? 0;
                jobData.post_html = await browsersFirstTab.$eval('#jobDescriptionText', el => el.outerHTML);

            } catch (error) {
                console.log('ERROR', error)
            }
        }
    }
    let newDBRecord = {
        source: "Indeed",
        jk: newJob.jk,
        title: jobData.title,
        company: jobData.company,
        search_query: newJob.search_query,
        salary_min: jobData.salary_min,
        salary_max: jobData.salary_max,
        link: newJob.link,
        post_html: jobData.post_html,
        status: "New",
        // date_posted: jsonData.datePosted,
        date_new: new Date().toISOString(),
        skills_known: "",
        // skills_unknown: "",
    }
    newDBRecord.post_html = highlightWords(newDBRecord.post_html);
    newDBRecord.skills_known = getSkills(newDBRecord.post_html, SKILLS_KNOWN);
    newDBRecord.skills_unknown = getSkills(newDBRecord.post_html, SKILLS_UNKNOWN);

    if (newDBRecord.skills_known.length === 0 || newDBRecord.skills_unknown.length > 0) {
        console.log("😔 Skipping Job", newDBRecord.skills_unknown.length, newDBRecord.skills_unknown);
        removeJobFromCache(newJob.jk);
        continue;
    }

    console.log("Saving to DB...")
    databaseConnection.run(
        INSERT_QUERY,
        [
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
            console.log("DB ID:", this.lastID);
            removeJobFromCache(newJob.jk);
        }
    );
}
// preparedStatement.finalize();

// Cleanup
await pauseInMs(PAUSE_IN_MS);
await browsersFirstTab.close();
await browser.close();

if (JOB_CACHE_FILE && fs.existsSync(JOB_CACHE_FILE)) {
    fs.unlinkSync(JOB_CACHE_FILE);
    console.log(`${JOB_CACHE_FILE} has been removed.`);
} else {
    console.log(`${JOB_CACHE_FILE} does not exist or is undefined.`);
}


// Close the database connection and exit the script
await pauseInMs(PAUSE_IN_MS);
databaseConnection.close((err) => {
    if (err) {
        console.error("Error while closing the database connection:", err);
    } else {
        console.log("Database connection closed successfully.");
    }
    console.log("All Done. Exiting...");
});

await pauseInMs(PAUSE_IN_MS);
process.exit(0); // Ensure the script exits after completing the operation
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
                   FROM jobs
                   WHERE source = 'Indeed'`;
    return new Promise((resolve, reject) => {
        db.all(query, [], (err, rows) => {
            if (err) {
                reject(err);
            }
            resolve(rows);
        });
    });
}

// async function openChrome() {
//     execSync('open -a "Google Chrome" --args --remote-debugging-port=9222 https://www.indeed.com');
//     console.log("Waiting for Chrome to launch...");
//     await new Promise(resolve => setTimeout(resolve, 10000));
//     return await chromium.connectOverCDP('http://127.0.0.1:9222');
// }

async function openChrome() {
    // Change "Default" to the desired profile directory name
    // const profile = "_Home_";
    const profile = "Profile 1";
    const url = "https://www.indeed.com";
    const remoteDebuggingPort = 9222;

    execSync(`open -na "Google Chrome" --args --remote-debugging-port=${remoteDebuggingPort} --profile-directory="${profile}" ${url}`);
    console.log("Waiting for Chrome to launch...");
    await new Promise(resolve => setTimeout(resolve, 10000));

    return await chromium.connectOverCDP(`http://127.0.0.1:${remoteDebuggingPort}`);
}

async function pauseInMs(pauseInMs) {
    console.log("Pausing...");
    await new Promise((resolve) => setTimeout(resolve, Math.floor(Math.random() * pauseInMs + 1000)),);
}

async function verificationRequiredCheck(page) {
    if (await page.evaluate((text) => document.body.innerText.includes(text), VERIFICATION_TEXT)) {
        console.log('!! ' + VERIFICATION_TEXT);
        await page.click('input[type="checkbox"]');
        await pauseInMs(3000)
        return true
        // await browser.close();
        // process.exit(1);
    }

    return false;
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
    } catch (error) {
        console.error("Error writing to cache file:", error);
    }
}

function removeJobFromCache(jk) {
    newCacheList = newCacheList.filter(job => job.jk !== jk);
    saveCache(newCacheList);
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