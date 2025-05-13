# Node Express API with SQLite

This is a simple Express API that provides access to SQLite databases in development and production environments.

## Features

- Express API with environment-specific configurations
- SQLite3 database integration
- SQL query endpoint for executing custom queries
- Health check endpoint

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Environment Configuration:
   - Development: `.env.development`
   - Production: `.env.production`

## Database Structure

The API automatically creates a `job` table in the database with the following structure:

```sql
CREATE TABLE job (
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
```

## Running the API

### Development Mode

```
npm run dev
```

This will start the server in development mode using the configuration from `.env.development`.

### Production Mode

```
npm start
```

This will start the server in production mode using the configuration from `.env.production`.

## API Endpoints

### Execute SQL Query

**Endpoint:** `POST /api/query`

**Request Body:**
```json
{
  "sql": "SELECT * FROM job",
  "params": []
}
```

- `sql`: The SQL query to execute
- `params`: (Optional) Array of parameters for prepared statements

**Response:**
```json
{
  "data": [
    {
      "job_id": 1,
      "company_id": 1,
      "jk": "test-job-key",
      "company_name": "Test Company",
      "title": "Software Engineer",
      "source": "Test Source",
      ...
    }
  ]
}
```

For non-SELECT queries, the response will include:
```json
{
  "changes": 1,
  "lastID": 1
}
```

### Health Check

**Endpoint:** `GET /api/health`

**Response:**
```json
{
  "status": "ok",
  "environment": "development"
}
```

## Testing

A test script is provided to verify the API functionality:

```
node test.js
```

This script will:
1. Test the health endpoint
2. Insert a test job record
3. Query all jobs from the database

Note: The server must be running in development mode before executing the test script.