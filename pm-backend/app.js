const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const sqlite3 = require('sqlite3');
const fs = require('fs').promises;
const path = require("path");
const req = require("express/lib/request");
const yaml = require('js-yaml');
const {marked} = require('marked');
const grayMatter = require('gray-matter');
const app = express();
const port = process.env.PORT || 5174;
const JOBS_NEW_PATH = process.env.JOBS_DIR ||
    '/Users/greg/Library/CloudStorage/Dropbox/PM/Areas/Job Search/Jobs';


dotenv.config();
app.use(cors());
app.use(express.json());
sqlite3.verbose();

const dbPath = process.env.NODE_ENV === 'production' ? process.env.DB_PATH_PROD : process.env.DB_PATH_DEV;
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Failed to connect to database:', err.message);
    } else {
        console.log('Connected to SQLite database');
    }
});

app.post('/api/db', (req, res) => {
    const {query, id} = req.body;
    console.log('Query:', dbPath, query);
    if (!query || typeof query !== 'string') {
        res.status(400).send('Invalid query');
        return;
    }
    const operation = query.trim().split(' ')[0].toUpperCase();
    if (!['SELECT', 'INSERT', 'UPDATE', 'DELETE'].includes(operation)) {
        res.status(400).send('Invalid SQL operation');
        return;
    }

    if (operation === 'SELECT') {
        db.all(query, [], (err, records) => {
            if (err) {
                console.error(err);
                res.status(500).send('Error retrieving records');
                return;
            }
            res.json(records);
        });
    } else {
        db.run(query, [], function (err) {
            if (err) {
                console.error(err);
                res.status(500).send(`Error executing ${operation} operation`);
                return;
            }
            if (operation === 'INSERT') {
                res.send(`Record inserted, ID: ${this.lastID}`);
            } else if (operation === 'UPDATE') {
                res.send(`Record updated, ID: ${id}`);
            } else if (operation === 'DELETE') {
                res.send(`Record deleted, ID: ${id}`);
            } else {
                res.send('Query executed successfully');
            }
        });
    }
});

app.get('/api/docs', (req, res) => {
    const fs = require('fs');
    const path = require('path');

    const docsDirectory = '/Users/greg/Notebooks/Docs';

    fs.readdir(docsDirectory, {withFileTypes: true}, (err, files) => {
        if (err) {
            console.error('Error reading docs directory:', err.message);
            res.status(500).send('Failed to read docs directory');
        } else {
            const filePaths = files
                .filter(file => file.isFile() && path.extname(file.name) === '.md')
                .map(file => `/${file.name}`);
            res.json(filePaths);
        }
    });
})

app.post('/api/doc', (req, res) => {
    const fs = require('fs');
    const path = require('path');
    console.log('Received request to read file:', req.body);
    const {fileName} = req.body; // Ensure fileName is read from request body

    console.log('Received fileName:', fileName);

    if (!fileName) {
        res.status(400).send('Missing fileName in request body');
        return;
    }

    const docsDirectory = '/Users/greg/Notebooks/Docs';
    const filePath = path.join(docsDirectory, fileName);

    fs.access(filePath, fs.constants.F_OK, (accessErr) => {
        if (accessErr) {
            console.error('File not found:', filePath);
            res.status(404).send('File not found');
            return;
        }

        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                console.error('Error reading the file:', err.message);
                res.status(500).send('Failed to read the file');
                return;
            }
            res.send(data);
        });
    });
});

app.get('/api/jobs/counters', async (req, res) => {
    let counters = {
        new: 0,
        applied: 0,
        deleted: 0,
        rejected: 0,
        accepted: 0,
        interview: 0,
        offer: 0,
        hired: 0,
    };

    try {
        const files = await fs.readdir(JOBS_NEW_PATH, {withFileTypes: true});
        const mdFiles = files.filter(file => file.isFile() && path.extname(file.name) === '.md');
        await Promise.all(
            mdFiles.map(async file => {
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
            })
        );

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
    db.close((err) => {
        if (err) {
            console.error('Error closing SQLite database connection:', err.message);
        } else {
            console.log('SQLite database connection closed');
        }
        process.exit(0);
    });
});


app.listen(port, () => {
    console.log(`Backend app listening at http://localhost:${port}`);
});