import {test, expect, chromium} from "@playwright/test";
import sqlite3 from "sqlite3";
import dotenv from "dotenv";

sqlite3.verbose();
dotenv.config();


import {execSync} from 'child_process';

try {
    console.log("Starting Chrome with remote debugging on port 9222...");
    execSync('open -a "Google Chrome" --args --remote-debugging-port=9222 https://www.indeed.com');
    await new Promise((resolve) =>
        setTimeout(resolve, Math.floor(5000)),
    );
    console.log("Chrome is running with remote debugging.");
} catch (err) {
    console.error("Failed to start Chrome with remote debugging:", err);
}

const dbFileName = "/Users/greg/Code/local/pm/pm-backend/db-prod.sqlite3";
const db = new sqlite3.Database(dbFileName, (err) => {
    if (err) {
        throw err;
    }
});
const excitingJkList = await new Promise((resolve, reject) => {
    db.all(`SELECT jk
            FROM jobs`, [], (err, rows) => {
        if (err) {
            reject(err);
        } else {
            const jkList = rows.map((row) => row.jk);
            resolve(jkList);
        }
    });
});
const jobTitles = [
    "PHP Developer",
    "Senior Full Stack Developer",
    "Senior Full Stack Engineer",
    "Full Stack Engineer",
    "Full Stack Developer",
];
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const page = browser.contexts()[0].pages()[0];
page.on('console', msg => {
    const text = msg.text();
    if (text.startsWith('>>>')) {
        console.log(text);
    }
});

for (const jobTitle of jobTitles) {
    try {
        console.log(">>>> ", jobTitle, " <<<<");

        const encodedJobTitle = jobTitle.replace(/ /g, "+");
        // fromage=last, fromage=1: 24 hours, fromage=3: 3 days
        // const fromage = 'last';
        const fromage = 1;
        const url = `https://www.indeed.com/jobs?q=${encodedJobTitle}&l=Remote&fromage=${fromage}`;
        console.log("URL:", url);
        await page.goto(url);
        await new Promise((resolve) =>
            setTimeout(resolve, Math.floor(Math.random() * 15000 + 1000)),
        );

        let pageNumber = 0;
        while (true) {
            pageNumber++;
            console.log("Page Number:", pageNumber);

            const jobData = await page.evaluate(async (excitingJkList) => {
                const jobCardsDiv = document.getElementById("mosaic-provider-jobcards");
                const jobCardsLinks = jobCardsDiv.querySelectorAll("a.jcs-JobTitle");
                const jobs = [];
                const jobLogMessages = [];

                for (const aElement of Array.from(jobCardsLinks)) {
                    const title = aElement.querySelector("span").innerText;
                    const jk = aElement.getAttribute("data-jk");
                    console.log(">>> Job: ", jk);

                    if (excitingJkList.includes(jk)) {
                        console.log(">>> Job Already Existed; Skip");
                        jobLogMessages.push(
                            `Job: ${title} (${title}) Already Existed; Skip`,
                        );
                        continue;
                    }

                    jobLogMessages.push(`>>> New Job: ${title} (${title})`);
                    excitingJkList.push(jk);

                    const href = aElement.getAttribute("href");
                    aElement.click();
                    await new Promise((resolve) => setTimeout(resolve, 3000));

                    const JobComponent = document.querySelector(
                        ".jobsearch-JobComponent",
                    );
                    const companyElement = JobComponent.querySelector(
                        'div[data-testid="inlineHeader-companyName"] a',
                    );
                    const company = companyElement
                        ? companyElement.childNodes[0].nodeValue.trim()
                        : null;
                    const companyLink =
                        companyElement && companyElement.getAttribute("href");
                    const salaryElement = JobComponent.querySelector(
                        "#salaryInfoAndJobType > span",
                    );
                    const salary = salaryElement
                        ? salaryElement.textContent
                        : null;
                    const jobDescriptionElement = JobComponent.querySelector(
                        "#jobDescriptionText",
                    );
                    let postHTML = jobDescriptionElement
                        ? jobDescriptionElement.outerHTML
                        : "";
                    postHTML = postHTML
                        .replace(/<img[^>]*>/g, "")
                        .replace(/<svg[^>]*>[\s\S]*?<\/svg>/g, "")
                        .replace(/<button[^>]*>[\s\S]*?<\/button>/g, "");

                    jobs.push({
                        jk,
                        postHTML,
                        href,
                        title,
                        company,
                        companyLink,
                        salary,
                    });
                }
                return {jobs, jobLogMessages};
            }, excitingJkList);

            const {jobs, jobLogMessages} = jobData;
            for (const job of jobs) {
                const {jk, postHTML, href, title, company, companyLink, salary} = job;

                console.log("Add Job to DB:", jk, title);
                const match_percentage = null
                const tech_stack = null
                const lastID = await new Promise((resolve, reject) => {
                    db.run(
                        `INSERT INTO jobs (jk, status, post_html, notes, link, title, company, company_link, salary,
                                           new_date, search_query)
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, DATE(CURRENT_TIMESTAMP), ?)`,
                        [
                            jk,
                            "New",
                            postHTML,
                            "",
                            "https://www.indeed.com" + href,
                            title,
                            company,
                            companyLink,
                            salary,
                            jobTitle
                        ],
                        function (err) {
                            if (err) {
                                console.log("Insert error:", jk);
                                resolve(null);
                            } else {
                                resolve(this.lastID);
                            }
                        },
                    );
                });
                console.log("lastID", lastID);
            }

            const nextPageLink = await page.$(
                'a[data-testid="pagination-page-next"]',
            );
            if (nextPageLink) {
                console.log("Wait ");
                await new Promise((resolve) =>
                    setTimeout(resolve, Math.floor(Math.random() * 15000 + 1000)),
                );
                console.log("\nLoad Next Page");
                await nextPageLink.click();
                await new Promise((resolve) =>
                    setTimeout(resolve, Math.floor(Math.random() * 4000 + 1000)),
                );
            } else {
                console.log("End of Jobs for: ",jobTitle);
                break;
            }
        }
    } catch (err) {
        console.error("Error occurred for jobTitle:", jobTitle, err);
    }
}
db.close();