const axios = require('axios');

// Test the /api/db-query endpoint
async function testDbQuery() {
  try {
    // Example query to show tables in the database
    const response = await axios.post('http://localhost:5174/api/db-query', {
      query: 'SHOW TABLES'
    });
    
    console.log('Response:', response.data);
    
    // Example query with parameters
    const userResponse = await axios.post('http://localhost:5174/api/db-query', {
      query: 'SELECT * FROM users WHERE id = ?',
      params: [1]
    });
    
    console.log('User Response:', userResponse.data);
  } catch (error) {
    console.error('Error testing DB query:', error.response ? error.response.data : error.message);
  }
}

testDbQuery();