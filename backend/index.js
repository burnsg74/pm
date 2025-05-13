const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Load environment variables based on NODE_ENV
const NODE_ENV = process.env.NODE_ENV || 'development';
dotenv.config({ path: path.resolve(__dirname, `.env.${NODE_ENV}`) });

const app = express();
const PORT = process.env.PORT || 5174;

console.log(`Starting server in ${NODE_ENV} mode on port ${PORT}`);

app.use(cors());
app.use(express.json());

// Database connection
const dbPath = process.env.DB_PATH || path.join(__dirname, `database_${NODE_ENV}.sqlite`);
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to the database:', err.message);
  } else {
    console.log(`Connected to the ${NODE_ENV} database at ${dbPath}`);
  }
});

// API endpoint to execute SQL queries
app.post('/api/query', (req, res) => {
  const { sql, params = [] } = req.body;
  console.log(sql, params);
  
  if (!sql) {
    return res.status(400).json({ error: 'SQL query is required' });
  }

  // Determine if it's a SELECT query or a modification query
  const isSelectQuery = sql.trim().toUpperCase().startsWith('SELECT');
  
  if (isSelectQuery) {
    db.all(sql, params, (err, rows) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      res.json({ data: rows });
    });
  } else {
    db.run(sql, params, function(err) {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      res.json({ 
        changes: this.changes,
        lastID: this.lastID
      });
    });
  }
});

// Basic health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', environment: NODE_ENV });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running in ${NODE_ENV} mode on port ${PORT}`);
});

// Handle process termination
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database connection:', err.message);
    } else {
      console.log('Database connection closed');
    }
    process.exit(0);
  });
});