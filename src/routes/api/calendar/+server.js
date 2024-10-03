import {json} from '@sveltejs/kit';
import sqlite3 from 'sqlite3';

sqlite3.verbose();
console.log(import.meta.env.VITE_APP_DB_FILE_NAME, import.meta.env);
const dbFileName = import.meta.env.VITE_APP_DB_FILE_NAME || 'db-prod.sqlite3';
console.log(dbFileName);

export async function GET() {
    sqlite3.verbose();
    const db = new sqlite3.Database(dbFileName, (err) => {
        if (err) {
            throw err;
        }
    });

    const selectSQL = `SELECT *
                       FROM events`;
    let events = [];
    try {
        events = await new Promise((resolve, reject) => {
            db.all(selectSQL, [], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    } catch (err) {
        return json({error: `Failed to retrieve event: ${err.message}`}, {status: 500});
    } finally {
        db.close();
    }

    // Return the newly inserted event data as JSON
    return json(events);
}

export async function POST(event) {
    const eventData = await event.request.json();
    console.log('dfn',dbFileName);
    const db = new sqlite3.Database(dbFileName, (err) => {
        if (err) {
            throw err;
        }
    });

    const insertSQL = `
        INSERT INTO events (groupId, allDay, start, "end", startStr, endStr, title, url,
                            classNames, editable, startEditable, durationEditable, resourceEditable,
                            display, overlap, "constraint", backgroundColor, borderColor, textColor,
                            extendedProps, source)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    // Insert the event data into the database
    let lastID = null;
    try {
        lastID = await new Promise((resolve, reject) => {
            db.run(insertSQL, [eventData.groupId, eventData.allDay, eventData.start, eventData.end, eventData.startStr, eventData.endStr, eventData.title, eventData.url, eventData.classNames, eventData.editable, eventData.startEditable, eventData.durationEditable, eventData.resourceEditable, eventData.display, eventData.overlap, eventData.constraint, eventData.backgroundColor, eventData.borderColor, eventData.textColor, eventData.extendedProps, eventData.source], function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.lastID);
                }
            });
        });
    } catch (err) {
        return json({error: `Failed to insert event: ${err.message}`}, {status: 500});
    }

    // Query to get the newly inserted event by ID
    const selectSQL = `SELECT *
                       FROM events
                       WHERE id = ?`;
    let newEvent = null;
    try {
        newEvent = await new Promise((resolve, reject) => {
            db.get(selectSQL, [lastID], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    } catch (err) {
        return json({error: `Failed to retrieve event: ${err.message}`}, {status: 500});
    } finally {
        db.close();
    }

    // Return the newly inserted event data as JSON
    return json(newEvent);
}

export async function PUT(event) {
    console.log('PUT Save event');
    sqlite3.verbose();
    const eventData = await event.request.json();
    console.log('eventData', eventData);
    const {id, ...updateData} = eventData;

    if (!id) {
        return json({error: 'Event ID is missing'}, {status: 400});
    }

    const db = new sqlite3.Database(dbFileName, (err) => {
        if (err) {
            throw err;
        }
    });

    const updateFields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
    const updateValues = Object.values(updateData);

    const updateSQL = `UPDATE events
                       SET ${updateFields}
                       WHERE id = ?`;

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
        return json({error: `Failed to update event: ${err.message}`}, {status: 500});
    }

    // Query to get the updated event by ID
    const selectSQL = `SELECT *
                       FROM events
                       WHERE id = ?`;
    let updatedEvent = null;
    try {
        updatedEvent = await new Promise((resolve, reject) => {
            db.get(selectSQL, [id], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    } catch (err) {
        return json({error: `Failed to retrieve updated event: ${err.message}`}, {status: 500});
    } finally {
        db.close();
    }

    // Return the updated event data as JSON
    return json(updatedEvent);
}