const express = require('express');
const dotenv = require('dotenv');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Load environment variables based on NODE_ENV
const NODE_ENV = process.env.NODE_ENV || 'development';
dotenv.config({ path: path.resolve(__dirname, `.env.${NODE_ENV}`) });

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Database connection
const dbPath = process.env.DB_PATH || path.join(__dirname, `database_${NODE_ENV}.sqlite`);
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to the database:', err.message);
  } else {
    console.log(`Connected to the ${NODE_ENV} database at ${dbPath}`);
    
    // Create job table if it doesn't exist
    db.run(`
      CREATE TABLE IF NOT EXISTS job (
        job_id INTEGER PRIMARY KEY AUTOINCREMENT,
        company_id INTEGER NOT NULL,
        jk TEXT NOT NULL UNIQUE,
        company_name TEXT NOT NULL,
        title TEXT NOT NULL,
        job_post TEXT,
        search_query TEXT,
        salary_min DECIMAL(10,2),
        salary_max DECIMAL(10,2),
        source TEXT NOT NULL,
        link TEXT,
        skills TEXT,
        status TEXT CHECK(status IN ('New', 'Applied', 'Interviewed', 'Rejected', 'Deleted', 'Saved')) DEFAULT 'New',
        is_local INTEGER NOT NULL DEFAULT 0,
        date_posted DATETIME,
        date_new DATETIME,
        date_applied DATETIME,
        date_saved DATETIME,
        date_interviewed DATETIME,
        date_deleted DATETIME,
        date_rejected DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        console.error('Error creating job table:', err.message);
      } else {
        console.log('Job table created or already exists');
      }
    });
  }
});

// API endpoint to execute SQL queries
app.post('/api/query', (req, res) => {
  const { sql, params = [] } = req.body;
  
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