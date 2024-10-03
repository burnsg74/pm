# Installation

https://svelte.dev/docs/introduction

```shell
npm create svelte@latest myapp
cd myapp
npm install
npm i -D @sveltejs/adapter-node
npm r @sveltejs/adapter-auto
npm run dev
```


```js
import sqlite3 from 'sqlite3';
sqlite3.verbose();

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({event, resolve}) {
    const db = new sqlite3.Database('db.sqlite', (err) => {
        if (err) {
            throw err;
        }
    });

    event.locals.db = db;

    const query = "CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT)"
    db.run(query, (err) => {
        if (err) {
            throw err
        }
    })

    return await resolve(event);
}
```

