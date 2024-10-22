import { json } from '@sveltejs/kit';
import sqlite3 from 'sqlite3';

sqlite3.verbose();
const dbFileName = import.meta.env.VITE_APP_DB_FILE_NAME || 'db-prod.sqlite3';

export async function GET() {
    const db = new sqlite3.Database(dbFileName, (err) => {
        if (err) {
            throw err;
        }
    });
    const selectSQL = `SELECT * FROM notes`;
    let notes = [];
    try {
        notes = await new Promise((resolve, reject) => {
            db.all(selectSQL, [], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    } catch (err) {
        return json({ error: `Failed to retrieve notes: ${err.message}` }, { status: 500 });
    } finally {
        db.close();
    }
    return json(notes);
}

export async function POST(note) {
    const noteData = await note.request.json();
    const db = new sqlite3.Database(dbFileName, (err) => {
        if (err) {
            throw err;
        }
    });
    const insertSQL = `INSERT INTO notes (title, content) VALUES (?, ?)`;
    let lastID = null;
    try {
        lastID = await new Promise((resolve, reject) => {
            db.run(insertSQL, [noteData.title, noteData.content], function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.lastID);
                }
            });
        });
    } catch (err) {
        return json({ error: `Failed to insert note: ${err.message}` }, { status: 500 });
    }
    const selectSQL = `SELECT * FROM notes WHERE id = ?`;
    let newNote = null;
    try {
        newNote = await new Promise((resolve, reject) => {
            db.get(selectSQL, [lastID], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    } catch (err) {
        return json({ error: `Failed to retrieve note: ${err.message}` }, { status: 500 });
    } finally {
        db.close();
    }
    return json(newNote);
}

export async function PUT(note) {
    const noteData = await note.request.json();
    const { id, ...updateData } = noteData;
    if (!id) {
        return json({ error: 'Note ID is missing' }, { status: 400 });
    }
    const db = new sqlite3.Database(dbFileName, (err) => {
        if (err) {
            throw err;
        }
    });
    const updateFields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
    const updateValues = Object.values(updateData);
    const updateSQL = `UPDATE notes SET ${updateFields} WHERE id = ?`;
    try {
        await new Promise((resolve, reject) => {
            db.run(updateSQL, [...updateValues, id], function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    } catch (err) {
        return json({ error: `Failed to update note: ${err.message}` }, { status: 500 });
    }
    const selectSQL = `SELECT * FROM notes WHERE id = ?`;
    let updatedNote = null;
    try {
        updatedNote = await new Promise((resolve, reject) => {
            db.get(selectSQL, [id], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    } catch (err) {
        return json({ error: `Failed to retrieve updated note: ${err.message}` }, { status: 500 });
    } finally {
        db.close();
    }
    return json(updatedNote);
}