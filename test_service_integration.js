// paste this and run it into a browser console
async function testLogin() {
  const gatekeeper_url = 'http://localhost:8001';
  const url = `${gatekeeper_url}/api/login/`;

  // User credentials in test database
  const data = {
    username: "admin",
    password: "admin"
  };

  try {
    // Send POST request to get the token
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(data)
    });

    if (response.ok) {
      // Extract tokens from the JSON response
      const tokens = await response.json();
      const token = tokens.access;
      console.log('Login successful! Access token:', token);
      return token;
    } else {
      const errorData = await response.json();
      console.error('Login failed:', errorData);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error during login:', error);
  }
}

async function fetchFarmData() {
  const apiUrl = 'http://localhost:8001/api/proxy/farmcalendar/api/v1/Farm/';

  try {
    if (!window.testToken) {
      throw new Error('No authentication token found. Please login first.');
    }

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${window.testToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const farmData = await response.json();
      console.log('Farm data:', farmData);
      return farmData;
    } else {
      const errorData = await response.json();
      console.error('Failed to fetch farm data:', errorData);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error fetching farm data:', error);
  }
}

// Run the function
testLogin().then(token => {
  if (token) {
    console.log('You can now use this token for authenticated requests');
    // You can store it for subsequent requests
    window.testToken = token;
    fetchFarmData()
  }
});
