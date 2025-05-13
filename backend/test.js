const http = require('http');

// Function to make a POST request to the API
function testApiQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      sql,
      params
    });

    const options = {
      hostname: 'localhost',
      port: 3001, // Development port
      path: '/api/query',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          resolve({ statusCode: res.statusCode, data: parsedData });
        } catch (e) {
          reject(new Error(`Failed to parse response: ${e.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

// Function to test the health endpoint
function testHealthEndpoint() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001, // Development port
      path: '/api/health',
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          resolve({ statusCode: res.statusCode, data: parsedData });
        } catch (e) {
          reject(new Error(`Failed to parse response: ${e.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

// Run tests
async function runTests() {
  console.log('Starting API tests...');
  
  try {
    // Test health endpoint
    console.log('\nTesting health endpoint...');
    const healthResponse = await testHealthEndpoint();
    console.log(`Status code: ${healthResponse.statusCode}`);
    console.log('Response:', healthResponse.data);
    
    // Test inserting a job
    console.log('\nTesting job insertion...');
    const insertResponse = await testApiQuery(`
      INSERT INTO job (company_id, jk, company_name, title, source)
      VALUES (1, 'test-job-key', 'Test Company', 'Software Engineer', 'Test Source')
    `);
    console.log(`Status code: ${insertResponse.statusCode}`);
    console.log('Response:', insertResponse.data);
    
    // Test querying jobs
    console.log('\nTesting job query...');
    const queryResponse = await testApiQuery('SELECT * FROM job');
    console.log(`Status code: ${queryResponse.statusCode}`);
    console.log('Response:', queryResponse.data);
    
    console.log('\nAll tests completed successfully!');
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

// Wait for the server to start before running tests
console.log('Please start the server with "npm run dev" in another terminal, then press any key to run tests...');
process.stdin.once('data', () => {
  runTests();
});