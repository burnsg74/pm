const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const fs = require('fs').promises;
const path = require("path");
const req = require("express/lib/request");
const yaml = require('js-yaml');
const {marked} = require('marked');
const grayMatter = require('gray-matter');
const mysql = require('mysql2/promise');
const app = express();
const port = process.env.PORT || 5174;
const JOBS_PATH = '/Users/greg/Library/CloudStorage/Dropbox/Notebooks/Job-Search/Jobs';
const SKILLS_KNOWN = ["HTML", "JavaScript", "CSS", "NoSQL", "SQL", "React", "Vue", "Node.js", "Node", "Python", "PHP", "Git", "AWS", "TypeScript", "Svelte", "Flutter", "Django", "Laravel", "jQuery", "SCSS", "Jest", "Cypress", "MySQL", "Javascript", "CI/CD", "Jira", "DynamoDB", "Linux", "Vuex", "Redis", "PostgreSQL"].map(escapeRegExp);

// Load environment variables based on NODE_ENV
const envFile = process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : '.env';
dotenv.config({ path: envFile });
console.log(`Loaded environment variables from ${envFile}`);
app.use(cors());
app.use(express.json());

// Create MySQL connection pool
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

app.post('/api/db-query', async (req, res) => {
    try {
        const { query, params } = req.body;
        console.log(query, params);
        if (!query) {
            return res.status(400).json({ error: 'Query is required' });
        }

        const [results] = await pool.execute(query, params || []);
        console.log(results);
        res.json(results);
    } catch (error) {
        console.error('Database query error:', error);
        res.status(500).json({ 
            error: 'Database query failed', 
            message: error.message,
            code: error.code
        });
    }
})

app.get('/api/jobs', async (req, res) => {
    try {
        const {status} = req.query;
        console.log('Status',status);

        async function readFilesRecursively(dir) {
            const entries = await fs.readdir(dir, {withFileTypes: true});
            let jobs = [];

            for (const entry of entries) {
                const entryPath = path.join(dir, entry.name);
                console.log(entryPath);

                if (entry.isDirectory()) {
                    const subJobs = await readFilesRecursively(entryPath);
                    jobs = jobs.concat(subJobs);
                } else if (entry.isFile() && entry.name === 'Job Post.md') {
                        const fileContent = await fs.readFile(entryPath, 'utf8');
                        const {data, content} = grayMatter(fileContent);

                        console.log('Status', data.status);
                        if (data && data.status && data.status !== status) {
                            continue;
                        }

                        const fileStat = await fs.stat(entryPath);

                        data.id = fileStat.ino;
                        data.file_path = entryPath;
                        data.content = content;
                        data.html = highlightWords(marked(content));

                        jobs.push(data);
                }
            }

            return jobs;
        }

        const filePath = path.join(JOBS_PATH);
        const jobs = await readFilesRecursively(filePath);
        res.status(200).send(jobs);
    } catch (error) {
        console.error("Error reading files:", error);
        res.status(500).send('Server Error');
    }
});

app.get('/api/jobs/status-count', async (req, res) => {
    try {
        const files = await fs.readdir(JOBS_PATH);
        const statusCounts = {
            'New': 0, 'Applied': 0, 'Saved': 0, 'Deleted': 0, 'Unknown': 0
        };

        async function readFilesRecursively(dir) {
            const entries = await fs.readdir(dir, {withFileTypes: true});
            for (const entry of entries) {
                const entryPath = path.join(dir, entry.name);

                if (entry.isDirectory()) {
                    await readFilesRecursively(entryPath);
                } else if (entry.isFile() && entry.name === 'Job Post.md') {
                    const fileContent = await fs.readFile(entryPath, 'utf8');
                    const {data} = grayMatter(fileContent);

                    if (data && data.status) {
                        statusCounts[data.status] = (statusCounts[data.status] || 0) + 1;
                    } else {
                        statusCounts['Unknown'] += 1;
                    }
                }
            }
        }

        await readFilesRecursively(JOBS_PATH);

        res.status(200).json(statusCounts);
    } catch (error) {
        console.error("Error reading files:", error);
        res.status(500).send('Server Error');
    }
});

app.put('/api/job', async (req, res) => {
    console.log('Put Job');
    try {
        const job = req.body;
        console.log(job, typeof job);

        if (!job || !job.file_path || !job.content) {
            res.status(400).send('Invalid job data');
            return;
        }

        try {

            if ('html' in job) {
                delete job.html;
            }
            let content = job.content;
            delete job.content;

            const yamlStr = yaml.dump(job);
            const fileContent = `---\n${yamlStr}\n---\n\n${content}`;
            await fs.writeFile(job.file_path, fileContent, 'utf8');

            res.status(200).send(job);
        } catch (error) {
            console.error('Error saving job:', error);
            res.status(500).send(error);
        }

        res.status(200).send();
    } catch (error) {
        console.error("Error reading files:", error);
        res.status(500).send('Server Error');
    }

});

app.get('/api/notes/markdown', async (req, res) => {
    const filePath = '/Users/greg/Code/bws/docs/Job Search.md';
    const fileContent = await fs.readFile(filePath, 'utf8');
    res.status(200).send(fileContent);
})

app.get('/api/notes/html', async (req, res) => {
    const filePath = '/Users/greg/Code/bws/docs/Job Search.md';
    const fileContent = await fs.readFile(filePath, 'utf8');
    const {data, content} = grayMatter(fileContent);
    res.status(200).send(marked(content));
})

app.put('/api/notes/markdown', async (req, res) => {
    const filePath = '/Users/greg/Code/bws/docs/Job Search.md';
    const fileContent = await fs.readFile(filePath, 'utf8');
    res.status(200).send(fileContent);
})

app.get('/api/job/get/:id', async (req, res) => {
    const jobId = req.params.id;
    try {
        const jobData = await findJobById(jobId);
        if (!jobData) {
            return res.status(404).send('Job not found');
        }
        return res.status(200).send(jobData);
    } catch (error) {
        console.error("Error reading files:", error);
        res.status(500).send('Server Error');
    }
});

async function findJobById(jobId) {
    const jobFiles = await fs.readdir(JOBS_PATH);

    for (const file of jobFiles) {
        if (!file.endsWith(".md")) {
            continue;
        }

        const jobFilePath = path.join(JOBS_PATH, file);
        const jobFileStat = await fs.stat(jobFilePath);

        if (jobFileStat.ino.toString() === jobId) {
            const fileContent = await fs.readFile(jobFilePath, 'utf8');
            const {data, content} = grayMatter(fileContent);

            return {
                ...data, id: jobFileStat.ino, file_path: jobFilePath, content,
            };
        }
    }

    return null;
}


app.get('/api/job/get-job-list', async (req, res) => {
    try {
        const files = await fs.readdir(JOBS_PATH);
        let jobs = [];
        for (const file of files) {
            if (file.endsWith(".md")) {

                const fileStat = await fs.stat(path.join(JOBS_PATH, file));
                const fileContent = await fs.readFile(path.join(JOBS_PATH, file), 'utf8');
                const {data} = grayMatter(fileContent);
                if (data && data.status) {
                    if (data.status === 'Deleted') {
                        continue;
                    }
                }
                let job = {
                    id: fileStat.ino,
                    source: data.source,
                    company: data.company,
                    title: data.title,
                    link: data.link,
                    status: data.status,
                    date_new: data.date_new,
                    date_applied: data.date_applied,
                    date_deleted: data.date_deleted,
                }
                jobs.push(job);
            }
        }
        res.status(200).send(jobs);
    } catch (error) {
        console.error("Error reading files:", error);
        res.status(500).send('Server Error');
    }

});

app.get('/api/job/get-job-new', async (req, res) => {
    try {
        const files = await fs.readdir(JOBS_PATH);
        let jobs = [];
        for (const file of files) {
            if (file.endsWith(".md")) {
                const fileStat = await fs.stat(path.join(JOBS_PATH, file));
                const fileContent = await fs.readFile(path.join(JOBS_PATH, file), 'utf8');
                const {data, content} = grayMatter(fileContent);

                if (data && data.status) {
                    if (data.status !== 'New') {
                        continue;
                    }
                    data.id = fileStat.ino;
                    data.file_path = path.join(JOBS_PATH, file);
                    data.content = content;
                    jobs.push(data);
                }
            }
        }
        res.status(200).send(jobs);
    } catch (error) {
        console.error("Error reading files:", error);
        res.status(500).send('Server Error');
    }

});
app.get('/api/job/get-job-saved', async (req, res) => {
    try {
        const files = await fs.readdir(JOBS_PATH);
        let jobs = [];
        for (const file of files) {
            if (file.endsWith(".md")) {
                const fileStat = await fs.stat(path.join(JOBS_PATH, file));
                const fileContent = await fs.readFile(path.join(JOBS_PATH, file), 'utf8');
                const {data, content} = grayMatter(fileContent);

                if (data && data.status) {
                    if (data.status !== 'Saved') {
                        continue;
                    }
                    data.id = fileStat.ino;
                    data.file_path = path.join(JOBS_PATH, file);
                    data.content = content;
                    jobs.push(data);
                }
            }
        }
        res.status(200).send(jobs);
    } catch (error) {
        console.error("Error reading files:", error);
        res.status(500).send('Server Error');
    }

});


app.get('/api/jobs/counters', async (req, res) => {
    let counters = {
        new: 0, applied: 0, deleted: 0, rejected: 0, accepted: 0, interview: 0, offer: 0, hired: 0,
    };

    try {
        const files = await fs.readdir(JOBS_NEW_PATH, {withFileTypes: true});
        const mdFiles = files.filter(file => file.isFile() && path.extname(file.name) === '.md');
        await Promise.all(mdFiles.map(async file => {
            const filePath = path.join(JOBS_NEW_PATH, file.name);
            try {
                const fileContent = await fs.readFile(filePath, 'utf8');
                const frontMatter = grayMatter(fileContent).data;
                if (frontMatter && frontMatter.status) {
                    const status = frontMatter.status.toLowerCase();
                    if (counters.hasOwnProperty(status)) {
                        counters[status]++;
                    }
                }
            } catch (fileErr) {
                console.error(`Error reading or parsing file ${file.name}:`, fileErr.message);
            }
        }));

        return res.json(counters);
    } catch (err) {
        console.error('Error reading jobs directory:', err.message);
        return res.status(500).send('Failed to process jobs directory');
    }
});


app.get('/api/jobs/new', (req, res) => {
    const fs = require('fs');
    const path = require('path');
    const JOBS_NEW_PATH = '/Users/greg/Library/CloudStorage/Dropbox/PM/Areas/Job Search/Jobs';
    fs.readdir(JOBS_NEW_PATH, {withFileTypes: true}, (err, files) => {
        if (err) {
            console.error('Error reading docs directory:', err.message);
            res.status(500).send('Failed to read docs directory');
        } else {
            const mdFiles = files.filter(file => file.isFile() && path.extname(file.name) === '.md');
            const fileData = mdFiles.map(file => {
                const filePath = path.join(JOBS_NEW_PATH, file.name);
                const fileContent = fs.readFileSync(filePath, 'utf8');

                let frontMatter = null;
                let markdownContent = fileContent;

                const frontMatterMatch = fileContent.match(/^---\n([\s\S]*?)\n---/);
                if (frontMatterMatch) {
                    try {
                        frontMatter = yaml.load(frontMatterMatch[1]);
                        markdownContent = fileContent.replace(frontMatterMatch[0], '').trim();
                    } catch (parseErr) {
                        console.error(`Error parsing YAML front matter in file ${file.name}:`, parseErr.message);
                    }
                }

                if (frontMatter?.area === "Job Search" && frontMatter?.type === "Job") {
                    const postHtml = marked(markdownContent);
                    return {filePath, frontMatter, fileContent, postHtml};
                }

                return null;
            }).filter(Boolean);
            res.json(fileData);
        }
    })
})


// saveContent
app.put('/api/saveContent', (req, res) => {
    const docsDirectory = '/Users/greg/Notebooks/Docs';
    const {fileName, content} = req.body;
    console.log(fileName, content)
    const filePath = path.join(docsDirectory, fileName);
    fs.writeFile(filePath, content, (err) => {
        if (err) {
            console.error('Error writing the file:', err.message);
            res.status(500).send('Failed to write the file');
            return;
        }
        res.send('File saved successfully');
    })
})

process.on('SIGINT', () => {
    console.log('Closing SQLite database connection due to app termination...');
    // db.close((err) => {
    //     if (err) {
    //         console.error('Error closing SQLite database connection:', err.message);
    //     } else {
    //         console.log('SQLite database connection closed');
    //     }
    //     process.exit(0);
    // });
});


app.listen(port, () => {
    console.log(`Backend app listening at http://localhost:${port}`);
});


function highlightWords(text) {
    if (!text) return "";

    const regex = new RegExp(`(?<!\\w)(${SKILLS_KNOWN.join("|")})(?!\\w)`, "gi",);
    return text.replace(regex, (match, p1) => {
        if (p1) {
            return `<span class="highlight-green">${match}</span>`;
        }
        return match;
    });
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]#\\]/g, "\\$&");
}