const express = require('express');
const app = express();
const port = 3001;

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS for all routes
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  next();
});

// OAuth callback endpoint
app.get('/oauth2/idpresponse', (req, res) => {
  console.log('\n=== GOOGLE OAUTH CALLBACK RECEIVED ===');
  console.log('Timestamp:', new Date().toISOString());
  console.log('URL:', req.url);
  console.log('Method:', req.method);
  
  console.log('\n--- QUERY PARAMETERS ---');
  console.log(JSON.stringify(req.query, null, 2));
  
  console.log('\n--- HEADERS ---');
  console.log(JSON.stringify(req.headers, null, 2));
  
  console.log('\n--- BODY (if any) ---');
  console.log(JSON.stringify(req.body, null, 2));
  
  console.log('\n=== END CALLBACK ===\n');
  
  // Check if we have an authorization code
  if (req.query.code) {
    console.log('✅ SUCCESS: Authorization code received:', req.query.code.substring(0, 20) + '...');
    
    // In a real app, you would exchange this code for tokens here
    // For now, we'll just redirect back to the app with success
    res.send(`
      <html>
        <head>
          <title>OAuth Debug - Success</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; background: #f0f0f0; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
            .success { color: #28a745; }
            .code { background: #f8f9fa; padding: 10px; border-radius: 4px; font-family: monospace; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1 class="success">✅ OAuth Success!</h1>
            <p>Authorization code received successfully.</p>
            <div class="code">
              <strong>Code:</strong> ${req.query.code}<br>
              <strong>State:</strong> ${req.query.state || 'Not provided'}<br>
              <strong>Scope:</strong> ${req.query.scope || 'Not provided'}
            </div>
            <p><em>Check your terminal for full details.</em></p>
            <script>
              // Try to redirect back to the app after 3 seconds
              setTimeout(() => {
                window.location.href = 'digitize-app://auth-success?code=${req.query.code}';
              }, 3000);
            </script>
          </div>
        </body>
      </html>
    `);
  } else if (req.query.error) {
    console.log('❌ ERROR: OAuth error received:', req.query.error);
    res.send(`
      <html>
        <head>
          <title>OAuth Debug - Error</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; background: #f0f0f0; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
            .error { color: #dc3545; }
            .code { background: #f8f9fa; padding: 10px; border-radius: 4px; font-family: monospace; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1 class="error">❌ OAuth Error</h1>
            <div class="code">
              <strong>Error:</strong> ${req.query.error}<br>
              <strong>Description:</strong> ${req.query.error_description || 'Not provided'}<br>
              <strong>State:</strong> ${req.query.state || 'Not provided'}
            </div>
            <p><em>Check your terminal for full details.</em></p>
          </div>
        </body>
      </html>
    `);
  } else {
    console.log('⚠️  UNKNOWN: No code or error in response');
    res.send(`
      <html>
        <head><title>OAuth Debug - Unknown Response</title></head>
        <body>
          <h1>⚠️  Unknown OAuth Response</h1>
          <p>Check terminal for details.</p>
        </body>
      </html>
    `);
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start the server
app.listen(port, () => {
  console.log(`🚀 OAuth Debug Server running at http://localhost:${port}`);
  console.log(`📡 OAuth callback URL: http://localhost:${port}/oauth2/idpresponse`);
  console.log(`🏥 Health check: http://localhost:${port}/health`);
  console.log('\n🔧 Add this to your Google Cloud Console authorized redirect URIs:');
  console.log(`   http://localhost:${port}/oauth2/idpresponse`);
  console.log('\n📱 Update your .env file:');
  console.log(`   EXPO_PUBLIC_GOOGLE_REDIRECT_URI=http://localhost:${port}/oauth2/idpresponse`);
  console.log('\n⏳ Waiting for OAuth callbacks...\n');
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down OAuth debug server...');
  process.exit(0);
});
