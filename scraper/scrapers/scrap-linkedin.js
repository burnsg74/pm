// import {test, expect, chromium} from "@playwright/test";
import { chromium } from '@playwright/test';

console.log("Scrap LinkedIn");
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const page = browser.contexts()[0].pages()[0];
page.on('console', msg => {
    const text = msg.text();
    if (text.startsWith('>>>')) {
        // console.log(text.replace('[MY_LOG] ', 'BROWSER LOG: '));
        console.log(text);
    }
});

console.log("Open LinkedIn"); // ember139
const jobData = await page.evaluate(async () => {
    const jobData = [];
    const listItems = document.querySelectorAll('ul.scaffold-layout__list-container > li.scaffold-layout__list-item');

    // Loop over each <li> element and extract the attribute value
    // document.querySelector("#ember214")
    for (const item of listItems) {
        const id = await item.getAttribute('data-occludable-job-id');
        console.log(">>> Job ID:", jobId);

        const Title = document.querySelector("div.job-details-jobs-unified-top-card__job-title > h1 > a").innerHTML
        console.log(">>> Job Title2:", Title);

        const jobDetails = document.querySelector('article.jobs-description__container').innerHTML;
        console.log(">>> Job Details:", jobDetails);

        // job-view-layout jobs-details
        // document.querySelector("#ember53")
        // /html/body/div[6]/div[3]/div[4]/div/div/main/div/div[2]/div[2]/div/div[2]/div/div[1]/div/div[1]/div/div[1]/div/div[2]/div/h1/a
        // jobs-description__container
        //

        // const linkElement = item.querySelector('a');
        //
        // if (linkElement) {
        //     linkElement.click();
        // } else {
        //     console.log("No <a> element found inside item");
        // }

        await new Promise((resolve) =>
            setTimeout(resolve, Math.floor(Math.random() * 2000 + 3000)),
        );
        console.log(jobId);
        jobData.push({ jobId });
    }

    return jobData;
});

console.log("Job Data:", jobData);

