import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;
const isDevelopment = process.env.NODE_ENV === 'development';
const database = isDevelopment ? 'pm-dev' : 'pm';

// Enable CORS for development
if (isDevelopment) {
    app.use(cors({ origin: 'http://localhost:5173' }));
}

// Middleware to parse JSON bodies
app.use(express.json());

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve the static files from the React app
console.log(path.join(__dirname, '../react-app/dist'));
app.use(express.static(path.join(__dirname, '../react-app/dist')));

// API routes
app.get('/api/hello', (req, res) => {
    res.json({ message: 'Hello from the backend!' });
});

// DB
app.post('/api/db', async (req, res) => {
    console.log('SQL:', req.body.SQL);

    // Create the connection to database
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        database: database,
    });

    try {
        const [results, fields] = await connection.query(
            req.body.SQL
        );

        console.log(results); // results contains rows returned by server
        res.json({results});
    } catch (err) {
        console.log(err);
    }


});

// Handles any requests that don't match the ones above
if (isDevelopment) {
    // Proxy Vite dev server
    app.use(
        '/',
        createProxyMiddleware({
            target: 'http://localhost:5173',
            changeOrigin: true,
            ws: true, // Enable WebSocket support
            logLevel: 'silent', // Adjust log level here if needed
        })
    );
} else {
    // Serve static files from the React app
    app.use(express.static(path.join(__dirname, 'dist')));
    // Serve index.html for all routes to support client-side routing
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
}

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});