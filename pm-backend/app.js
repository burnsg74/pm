const express = require('express');
const sqlite3 = require('sqlite3');
const dotenv = require('dotenv');
const app = express();
const port = process.env.PORT || 5174;
const cors = require('cors');
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