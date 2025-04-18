import {chromium} from "@playwright/test";
import {execSync} from 'child_process';
import dotenv from "dotenv";
import fs from "fs";
import matter from 'gray-matter';
import path from "node:path";
import Turndown from "turndown";
import * as mysql from "mysql2/promise";

dotenv.config({path: `../../.env.${process.env.NODE_ENV ?? 'development'}`});

// --- Constants ---
const PROJECT_PATH = '/Users/greg/Library/CloudStorage/Dropbox/Notebooks/Job-Search/Jobs';
const FROM_AGE = '1'; // in days last, 1, 3
// const SEARCH_TERMS = ["Backend Developer", "Frontend Developer", "PHP Developer", "Senior Full Stack Engineer", "Senior Full Stack Developer", "Web Developer"];
const SEARCH_TERMS = ["Laravel PHP Developer"]
const SKILLS_KNOWN = ["HTML", "JavaScript", "CSS", "NoSQL", "SQL", "React", "Vue", "Node.js", "Node", "Python", "PHP", "Git", "AWS", "TypeScript", "Svelte", "Flutter", "Django", "Laravel", "jQuery", "SCSS", "Jest", "Cypress", "MySQL", "Javascript", "CI/CD", "Jira", "DynamoDB", "Linux", "Vuex", "Redis", "PostgreSQL"].map(escapeRegExp);
const SKILLS_UNKNOWN = [".Net", "ASP.NET", "C#", "C++", "Drupal", "Flutter", "Golang", "Kotlin", "MS SQL", "MSSQL", "Next.js", "Spring", "Swift", "VB", "VB.Net", "Visual Basic", "Wordpress"].map(escapeRegExp);
const VERIFICATION_TEXT = "Additional Verification Required";
const EXPIRED_TEXT = "This job has expired on Indeed";
const NEXT_PAGE_SELECTOR = 'a[data-testid="pagination-page-next"]';
const JOB_CACHE_FILE = 'cache/jobsCacheIndeed.json';
const PAUSE_IN_MS = 20000;
const turnDownService = new Turndown();
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

let newCacheList = [];
let newJobList = loadCache();
let browser = null;
let browsersFirstTab = null;
let existingJobKeys = null;

// --------------------------------------------------------------------- //
// PHASE 1 :: Get all job keys for search terms
console.log("PHASE 1 :: Get all job keys for search terms");
try {
    await archiveOldJobs();
    existingJobKeys = await getExistingJobKeys();
    console.log("Existing Jobs in DB:", existingJobKeys.length);

    browser = await openChrome();
    browsersFirstTab = BrowsersFirstTab(browser);

    for (const [index, SEARCH_TERM] of SEARCH_TERMS.entries()) {
        console.log(`Processing jobs for search term: "${SEARCH_TERM}" (${index + 1} of ${SEARCH_TERMS.length})`);
        const url = `https://www.indeed.com/jobs?q=${encodeURIComponent(SEARCH_TERM)}&l=Remote&fromage=${FROM_AGE}`;
        await browsersFirstTab.goto(url);
        await verificationRequiredCheck(browsersFirstTab);
        await pauseInMs(PAUSE_IN_MS);
        const jobCountElement = await browsersFirstTab.$('.jobsearch-JobCountAndSortPane-jobCount');
        const jobCountText = jobCountElement ? await jobCountElement.textContent() : '';
        console.log(`Job Count: ${jobCountText}`);
        const jobCount = parseInt(jobCountText.replace(/[^0-9]/g, ''), 10);
        if (!jobCount || jobCount === 0) {
            console.log(`No jobs found for search term: "${SEARCH_TERM}". Skipping to next term...`);
            await pauseInMs(PAUSE_IN_MS);
            continue;
        }

        let pageNumber = 0;
        while (true) {
            pageNumber++;
            console.log(SEARCH_TERM, ": Page Number:", pageNumber);

            const pageJobList = await getPageJobList(browsersFirstTab, existingJobKeys);
            console.log("Page Job List:", pageJobList.length);

            updateNewJobList(pageJobList, SEARCH_TERM);

            if (!(await clickNextPageLink(browsersFirstTab))) {
                break;
            }
            await pauseInMs(PAUSE_IN_MS);
            await verificationRequiredCheck(browsersFirstTab);
        }

    }
    console.log("New Jobs Found:", newJobList.length);
} catch (error) {
    console.error("Error:", error);
}

// PHASE 2 :: Get Job Details
try {
    console.log('PHASE 2 :: Get Job Details')
    let i = 0;
    for (const newJob of newJobList) {
        console.log("\n----------------------------------------");
        console.log(++i, "of", newJobList.length, ":", newJob.jk, " - ", newJob.title);

        const URL = newJob.link;
        let jobData = {
            title: '', company: '', salary_min: 0, salary_max: 0, post_html: '', date_posted: null,
        }

        await browsersFirstTab.goto(URL);
        await pauseInMs(PAUSE_IN_MS);
        await verificationRequiredCheck(browsersFirstTab);

        let hasValidLdJson = false;
        const scriptTag = await browsersFirstTab.$('script[type="application/ld+json"]');
        if (scriptTag) {
            const jsonContent = await scriptTag.evaluate((el) => el.textContent.trim());
            if (isValidJson(jsonContent)) {
                hasValidLdJson = true;
                const jsonData = JSON.parse(jsonContent);
                jobData.date_posted = jsonData.datePosted;
                jobData.title = jsonData.title;
                jobData.company = jsonData.hiringOrganization?.name;
                jobData.salary_min = jsonData.baseSalary?.value?.minValue || null;
                jobData.salary_max = jsonData.baseSalary?.value?.maxValue || null;
                jobData.post_html = jsonData.description.replace(/\n/g, '').trim();
            }
        }

        if (!hasValidLdJson) {
            let {salary_min, salary_max} = await getSalary();
            jobData.title = await browsersFirstTab.textContent('h1[data-testid="jobsearch-JobInfoHeader-title"]');
            jobData.company = await browsersFirstTab.textContent('div[data-testid="inlineHeader-companyName"]');
            jobData.salary_min = salary_min ?? 0;
            jobData.salary_max = salary_max ?? 0;
            jobData.post_html = await browsersFirstTab.$eval('#jobDescriptionText', el => el.outerHTML);
        }

        jobData.skills = getSkills(jobData.post_html, SKILLS_KNOWN);

        const company = await findOrCreateCompany(jobData.company);
        console.log("Company:", company);

        await insertJob({
            company_id: company.company_id,
            source: "Indeed",
            jk: newJob.jk,
            title: jobData.title,
            skills: jobData.skills,
            search_query: newJob.search_query,
            salary_min: jobData.salary_min,
            salary_max: jobData.salary_max,
            link: newJob.link,
            job_post: jobData.post_html,
            status: "New",
            date_posted: jobData.date_posted ? new Date(jobData.date_posted).toISOString().slice(0, 19).replace('T', ' ') : null,
            date_new: new Date()
        });
    }
    await browser.close();
    process.exit(0);
} catch (error) {
    console.error("Error:", error);
}


//-------------------------------------------------------//

async function archiveOldJobs() {
    const conn = await pool.getConnection();
    try {
        const [result] = await conn.query(
            `UPDATE job 
             SET status = 'Deleted', 
                 date_deleted = CURRENT_TIMESTAMP 
             WHERE updated_at < DATE_SUB(NOW(), INTERVAL 1 MONTH) 
             AND status != 'Deleted'`
        );
        console.log(`Updated ${result.affectedRows} old jobs to 'Deleted' status`);
    } catch (error) {
        console.error('Error updating old jobs:', error);
        throw error;
    } finally {
        conn.release();
    }
}

async function getExistingJobKeys() {
    const existingJobKeys = [];
    const conn = await pool.getConnection();
    try {
        const [rows] = await conn.query(
            'SELECT jk FROM job WHERE date_new >= DATE_SUB(NOW(), INTERVAL 2 WEEK)'
        );
        rows.forEach(row => existingJobKeys.push(row.jk));
    } catch (error) {
        console.error('Error getting existing job keys:', error);
    } finally {
        conn.release();
    }
    return existingJobKeys;
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]#\\]/g, "\\$&");
}

async function openChrome() {
    const profile = "Profile 1";
    const url = "https://www.indeed.com";
    const remoteDebuggingPort = 9222;

    function closeChromeIfOpen() {
        try {
            execSync(`pkill -f "Google Chrome"`);
            console.log("Closed existing Chrome instances.");
        } catch (error) {
            console.log("No existing Chrome instances were running.");
        }
    }

    closeChromeIfOpen();
    execSync(`open -na "Google Chrome" --args --remote-debugging-port=${remoteDebuggingPort} --profile-directory="${profile}" ${url}`);
    console.log("Pause while Chrome starts up and connects to the remote debugger...");
    await new Promise(resolve => setTimeout(resolve, 10000));

    return await chromium.connectOverCDP(`http://127.0.0.1:${remoteDebuggingPort}`);
}

function BrowsersFirstTab(browser) {
    return browser.contexts()[0].pages()[0];
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



// Cleanup
await browser.close();
console.log("All Done. Exiting...");
process.exit(0);

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

async function getPageJobList(page, existingJobKeys) {
    return await page.evaluate(async (existingJobKeys) => {
        const jobCardsDiv = document.getElementById("mosaic-provider-jobcards");
        if (!jobCardsDiv) {
            console.log("Job cards division not found on this page.");
            return [];
        }
        const jobCardsLinks = jobCardsDiv.querySelectorAll("a.jcs-JobTitle");
        const pageJobList = [];
        for (const aElement of Array.from(jobCardsLinks)) {
            const jk = aElement.getAttribute("data-jk");
            if (existingJobKeys.includes(jk)) continue;
            const href = "https://www.indeed.com" + aElement.getAttribute("href");
            const title = aElement.textContent.trim();
            pageJobList.push({jk, href, title});
        }

        return pageJobList;
    }, existingJobKeys);
}

function updateNewJobList(pageJobList, searchTerm) {
    let pageStats = {
        total: pageJobList.length, new: 0, updated: 0, exciting: 0, unChanged: 0,
    };
    pageJobList.forEach(pageJob => {

        const repeatedJob = newJobList.find(job => job.jk === pageJob.jk);
        if (!repeatedJob) {
            newJobList.push({jk: pageJob.jk, title: pageJob.title, link: pageJob.href, search_query: searchTerm});
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

async function findOrCreateCompany(companyName, noteId = null) {
    if (!companyName) {
        throw new Error('Company name is required');
    }

    const conn = await pool.getConnection();

    try {
        await conn.beginTransaction();

        const [rows] = await conn.query(
            'SELECT * FROM company WHERE name = ?',
            [companyName]
        );

        if (rows.length > 0) {
            await conn.commit();
            return rows[0];
        }

        const [result] = await conn.query(
            'INSERT INTO company (name) VALUES (?)',
            [companyName]
        );

        const [newCompany] = await conn.query(
            'SELECT * FROM company WHERE company_id = ?',
            [result.insertId]
        );

        await conn.commit();
        return newCompany[0];

    } catch (error) {
        await conn.rollback();
        console.error('Error finding or creating company:', error);
        throw error;
    } finally {
        conn.release();
    }
}

async function insertJob(jobData) {
    const conn = await pool.getConnection();
    try {
        const fields = Object.keys(jobData).filter(key => jobData[key] !== undefined);
        const placeholders = fields.map(() => '?').join(', ');
        const values = fields.map(field => jobData[field]);
        const query = `INSERT INTO job (${fields.join(', ')}) VALUES (${placeholders})`;

        await conn.beginTransaction();
        const [result] = await conn.query(query, values);
        await conn.commit();

        return {
            jobId: result.insertId,
            affected: result.affectedRows,
            success: true
        };
    } catch (error) {
        await conn.rollback();
        console.error('Error inserting job:', error);
        throw error;
    } finally {
        conn.release();
    }
}