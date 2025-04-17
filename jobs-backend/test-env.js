const dotenv = require('dotenv');
const mysql = require('mysql2/promise');

// Load environment variables based on NODE_ENV
const envFile = process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : '.env';
dotenv.config({ path: envFile });

console.log(`Loaded environment variables from ${envFile}`);
console.log('Environment configuration:');
console.log(`- NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
console.log(`- DB_HOST: ${process.env.DB_HOST}`);
console.log(`- DB_USER: ${process.env.DB_USER}`);
console.log(`- DB_PASSWORD: ${process.env.DB_PASSWORD ? '******' : 'not set'}`);
console.log(`- DB_NAME: ${process.env.DB_NAME}`);
console.log(`- DB_PORT: ${process.env.DB_PORT}`);

async function testConnection() {
  try {
    // Create MySQL connection pool
    const pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT,
      waitForConnections: true,
      connectionLimit: 1,
      queueLimit: 0
    });

    console.log('\nAttempting to connect to database...');
    const connection = await pool.getConnection();
    console.log('Successfully connected to database!');
    
    // Release the connection
    connection.release();
    
    // End the pool
    await pool.end();
    
    console.log('Connection test completed successfully.');
  } catch (error) {
    console.error('Error connecting to database:', error.message);
  }
}

testConnection();