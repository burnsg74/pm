import ChromeBrowser from "./lib/ChromeBrowser.js";

const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:5174';
const SKILLS_KNOWN = ["HTML", "JavaScript", "CSS", "NoSQL", "SQL", "React", "Vue", "Node.js", "Node", "Python", "PHP", "Git", "AWS", "TypeScript", "Svelte", "Flutter", "Django", "Laravel", "jQuery", "SCSS", "Jest", "Cypress", "MySQL", "Javascript", "CI/CD", "Jira", "DynamoDB", "Linux", "Vuex", "Redis", "PostgreSQL"].map(escapeRegExp);
const SKILLS_UNKNOWN = [".Net", "ASP.NET", "C#", "C++", "Drupal", "Flutter", "Golang", "Kotlin", "MS SQL", "MSSQL", "Next.js", "Spring", "Swift", "VB", "VB.Net", "Visual Basic", "Wordpress"].map(escapeRegExp);
// const SEARCH_TERMS = ["Backend Developer", "Frontend Developer", "PHP Developer", "Senior Full Stack Engineer", "Senior Full Stack Developer", "Web Developer"];
const SEARCH_TERMS = [
    "PHP Developer NOT Full Stack",
];

const INDEED_CONFIG = {
    BASE_URL: 'https://www.indeed.com',
    SELECTORS: {
        MAIN_CONTENT: '#jobsearch-Main',
        JOB_COUNT: '.jobsearch-JobCountAndSortPane-jobCount',
        JOB_LINKS: 'div.nonRecommendation-section a.jcs-JobTitle'
    },
    DELAYS: {
        AFTER_PAGE_LOAD: 1000,
        AFTER_JOB_DETAIL: 5000,
        FINAL_DELAY: 5000
    },
    TIMEOUTS: {
        PAGE_LOAD: 30000
    },
    QUERIES: [
        {
            query: '',
            fromAge: 1,
            location: 'Newport, OR',
            radius: 10,
            from: 'searchOnDesktopSerp',
            vjk: '31882e878e2c08e0',
            isLocal: true,
        },
        {
            query: '',
            fromAge: 1,
            location: 'Waldport, OR',
            radius: 10,
            from: 'searchOnDesktopSerp',
            vjk: '31882e878e2c08e0',
            isLocal: true,
        },
        {
            query: 'Full Stack Engineer OR Full Stack Developer',
            fromAge: 1,
            location: 'Remote',
            radius: '',
            from: 'searchOnDesktopSerp',
            vjk: '31882e878e2c08e0',
            isLocal: false,
        },
        {
            query: 'Web Developer NOT Frontend NOT Backend NOT PHP NOT Full Stack',
            fromAge: 1,
            location: 'Remote',
            radius: '',
            from: 'searchOnDesktopSerp',
            vjk: '31882e878e2c08e0',
            isLocal: false,
        },
        {
            query: 'Backend Developer NOT Frontend NOT Full Stack',
            fromAge: 1,
            location: 'Remote',
            radius: '',
            from: 'searchOnDesktopSerp',
            vjk: '31882e878e2c08e0',
            isLocal: false,
        },

        {
            query: 'Frontend Developer NOT Backend NOT Full Stack',
            fromAge: 1,
            location: 'Remote',
            radius: '',
            from: 'searchOnDesktopSerp',
            vjk: '31882e878e2c08e0',
            isLocal: false,
        }
        ,
        {
            query: 'PHP Developer NOT Full Stack',
            fromAge: 1,
            location: 'Remote',
            radius: '',
            from: 'searchOnDesktopSerp',
            vjk: '31882e878e2c08e0',
            isLocal: false,
        }

    ]
};

// https://www.indeed.com/jobs?q=Senior+Full+Stack+Engineer&l=Remote&fromage=1&sc=0kf%3Aattr%28DSQF7%29%3B&from=searchOnDesktopSerp&vjk=8520f408f65c057f

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]#\\]/g, "\\$&");
}

async function fetchExistingJobKeys() {
    const sql = `SELECT jk
                 FROM job`;

    try {
        console.log('Fetching existing job keys...', `${API_BASE_URL}/api/query`);

        const response = await fetch(`${API_BASE_URL}/api/query`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({sql})
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Server response:', errorText);
            throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
        }

        const result = await response.json();
        const jobKeys = result.data.map(job => job.jk);
        console.log(`Fetched ${jobKeys.length} existing job keys`);
        return jobKeys;
    } catch (error) {
        console.error('Error fetching job keys:', error);
        throw error;
    }
}

async function insertJob(jobData) {
    const sql = `INSERT INTO job (jk,
                                  company_name,
                                  title,
                                  job_post,
                                  salary_min,
                                  salary_max,
                                  source,
                                  link,
                                  skills,
                                  is_local,
                                  date_posted,
                                  date_new)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const params = [
        jobData.jk,
        jobData.company,
        jobData.title,
        jobData.post_html,
        jobData.salary_min,
        jobData.salary_max,
        'Indeed',
        jobData.link,
        jobData.skills,
        jobData.is_local,
        jobData.date_posted,
        jobData.date_new
    ];

    try {
        const response = await fetch(`${API_BASE_URL}/api/query`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({sql, params})
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Server response:', errorText);
            throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
        }

        const result = await response.json();
        console.log('Insert successful:', result);
        return result;
    } catch (error) {
        console.error('Error inserting job:', error);
        throw error;
    }
}

async function main() {
    const browser = new ChromeBrowser();
    await browser.initialize();

    try {
        // Fetch existing job keys from the database
        const existingJobKeys = await fetchExistingJobKeys();
        console.log(`Found ${existingJobKeys.length} existing jobs in the database`);

        const jobListTab = await browser.getTab(1);
        await jobListTab.goto(INDEED_CONFIG.BASE_URL);
        await jobListTab.waitForSelector('#jobsearch-Main', {timeout: 30000});

        const jobDetailTab = await browser.getTab(2);
        for (const query of INDEED_CONFIG.QUERIES) {
            console.log('Query:', query);

            await jobListTab.goto(`${INDEED_CONFIG.BASE_URL}/jobs?q=${query.query}&l=${query.location}&fromage=${query.fromAge}&radius=${query.radius}&from=${query.from}&vjk=${query.vjk}`);
            await jobListTab.waitForSelector('#jobsearch-Main', {timeout: 30000});
            console.log('Sleeping for 1 seconds...');
            await browser.delay(1000);

            const jobCountElement = await jobListTab.$('.jobsearch-JobCountAndSortPane-jobCount');
            const jobCountText = jobCountElement ? await jobCountElement.textContent() : '';
            const jobCount = parseInt(jobCountText.replace(/[^0-9]/g, ''), 10);

            console.log(`Job Count: ${jobCount}`);
            if (!jobCount || jobCount === 0) {
                console.log('No jobs found');
                continue;
            }

            let pageNumber = 0;
            while (true) {
                pageNumber++;
                console.log(`Page Number: ${pageNumber}`);
                const jobLinks = await jobListTab.$$('div.nonRecommendation-section a.jcs-JobTitle');

                console.log(jobLinks.length);
                if (!jobLinks || jobLinks.length === 0) {
                    console.log('No more jobs found');
                    continue;
                }

                for (const jobLink of jobLinks) {
                    try {
                        const jobTitle = await jobLink.textContent();
                        const jobLinkHref = await jobLink.getAttribute('href');
                        const jk = await jobLink.getAttribute('data-jk')

                        console.log(`Job Title: ${jobTitle}`);
                        console.log('JoB Key:', jk);

                        if (existingJobKeys.includes(jk)) {
                            console.log(`Job with key ${jk} already exists in database. Skipping...`);
                            continue;
                        }

                        await jobDetailTab.goto('https://www.indeed.com' + jobLinkHref);
                        console.log('Sleeping for 5 seconds...');
                        await browser.delay(2000);

                        let jobData = {
                            jk,
                            link: 'https://www.indeed.com' + jobLinkHref,
                            skills: '',
                            is_local: query.isLocal,
                            title: '',
                            company: '',
                            salary_min: 0,
                            salary_max: 0,
                            post_html: '',
                            date_posted: null,
                            date_new: new Date()
                        }

                        let hasValidLdJson = false;
                        const scriptTag = await jobDetailTab.$('script[type="application/ld+json"]');
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
                                console.log('From JSON');
                            }
                        }

                        if (!hasValidLdJson) {
                            let {salary_min, salary_max} = await getSalary(jobDetailTab);
                            jobData.title = await jobDetailTab.textContent('h1[data-testid="jobsearch-JobInfoHeader-title"]');
                            jobData.company = await jobDetailTab.textContent('div[data-testid="inlineHeader-companyName"]');
                            jobData.salary_min = salary_min ?? 0;
                            jobData.salary_max = salary_max ?? 0;
                            jobData.post_html = await jobDetailTab.$eval('#jobDescriptionText', el => el.outerHTML);
                            console.log('From HTML');
                        }

                        let requirements = await extractSkills(jobDetailTab);
                        if (requirements && requirements.length > 0) {
                            const requirementsList = `<div class="requirements-section"><h3>Requirements:</h3><ul>${requirements.map(skill => `<li>${skill}</li>`).join('')} </ul> </div>`;
                            jobData.post_html = requirementsList + jobData.post_html;
                        }

                        jobData.skills = getSkills(jobData.post_html, SKILLS_KNOWN);
                        jobData.post_html = highlightWords(jobData.post_html);

                        try {
                            await insertJob(jobData);
                        } catch (error) {
                            console.error('Error processing job1:', error);
                            continue;
                        }
                    } catch (error) {
                        console.error('Error processing job2:', error);
                        continue;
                    }
                }

                const nextPageLink = await jobListTab.$('a[data-testid="pagination-page-next"]');
                if (nextPageLink) {
                    await nextPageLink.click();
                    await jobListTab.waitForSelector('#jobsearch-Main', {timeout: 30000});
                    await browser.delay(1000);
                } else {
                    break;
                }
            }

        }

        console.log('Done. Sleeping for 5 seconds...');
        await browser.delay(5000);

    } catch (error) {
        console.error('Error during browser operation:', error);
        throw error;
    } finally {
        await browser.cleanup();
    }

    function isValidJson(jsonContent) {
        try {
            JSON.parse(jsonContent);
            return true;
        } catch (error) {
            return false
        }
    }

    async function extractSkills(page) {
        const skills = await page.evaluate(() => {
            const extractedSkills = [];
            const skillButtons = document.querySelectorAll('li[data-testid="list-item"] button');
            skillButtons.forEach(button => {
                const skillName = button.querySelector('span');
                if (skillName) {
                    extractedSkills.push(skillName.textContent.trim());
                }
            });

            return extractedSkills;
        });

        return skills;
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

    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]#\\]/g, "\\$&");
    }

    async function getSalary(jobDetailTab) {
        try {
            await jobDetailTab.waitForSelector('#salaryInfoAndJobType', {state: 'visible', timeout: 1000});
            let salaryInfoAndJobType = await jobDetailTab.textContent('#salaryInfoAndJobType');
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
}

main()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));