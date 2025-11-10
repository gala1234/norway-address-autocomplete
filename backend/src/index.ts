import app from './app'; // Import the configured app

const port = 8080;

// Start the server
app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});