const express = require('express');
const sqlite3 = require('sqlite3');
const dotenv = require('dotenv');
const app = express();
const port = process.env.PORT || 5174;
const cors = require('cors');
const fs = require("fs");
const path = require("path");
const req = require("express/lib/request");
console.log('PORT:', port);

dotenv.config();
sqlite3.verbose();

const dbPath = process.env.NODE_ENV === 'production' ? process.env.DB_PATH_PROD : process.env.DB_PATH_DEV;

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Failed to connect to database:', err.message);
    } else {
        console.log('Connected to SQLite database');
    }
});

app.use(cors());
app.use(express.json());

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
    const { fileName } = req.body; // Ensure fileName is read from request body

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

app.post('/api/worklogs', (req, res) => {
    const {startAt, duration, subject, description, scratchpad} = req.body;

    // Validate required fields
    if (!startAt || !duration || !subject) {
        res.status(400).send('Missing required fields: start_at, duration, or subject');
        return;
    }

    const endAtDate = new Date(new Date(startAt).getTime() + duration * 60000).toISOString();
    const query = `
        INSERT INTO work_log (start_at, end_at, duration, subject, description, scratchpad)
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    const params = [startAt, endAtDate, duration, subject, description || null, scratchpad || null];

    db.run(query, params, function (err) {
        if (err) {
            console.error('Error inserting worklog:', err.message);
            res.status(500).send('Failed to save worklog');
            return;
        }
        db.get('SELECT * FROM work_log WHERE id = ?', [this.lastID], (err, row) => {
            if (err) {
                res.status(500).send({error: "Failed to retrieve record"});
                return;
            }

            res.status(201).send(row);
        });
    })
});

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