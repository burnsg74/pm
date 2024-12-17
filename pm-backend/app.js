const express = require('express');
const sqlite3 = require('sqlite3');
const dotenv = require('dotenv');
const app = express();
const port = process.env.PORT || 5174;
const cors = require('cors');
console.log('PORT:', port);

dotenv.config();
sqlite3.verbose();

const dbPath = process.env.NODE_ENV === 'production'
    ? process.env.DB_PATH_PROD
    : process.env.DB_PATH_DEV;

app.use(cors());
app.use(express.json());

app.get('/api/hello', (req, res) => {
    res.send('Hello World!');
});

app.post('/api/db', (req, res) => {
    const { query, id } = req.body;
    console.log('Query:', query);
    if (!query || typeof query !== 'string') {
        res.status(400).send('Invalid query');
        return;
    }
    const operation = query.trim().split(' ')[0].toUpperCase();
    if (!['SELECT', 'INSERT', 'UPDATE', 'DELETE'].includes(operation)) {
        res.status(400).send('Invalid SQL operation');
        return;
    }

    sqlite3.verbose();
    const db = new sqlite3.Database(dbPath);

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

    db.close();
});


app.listen(port, () => {
    console.log(`Backend app listening at http://localhost:${port}`);
});