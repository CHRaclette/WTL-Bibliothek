// server.js
const express = require('express');
const app = express();

// Built-in body parser for JSON
app.use(express.json());

// Example route
app.get('/', (req, res) => {
  res.json({ message: 'Hello from Express 👋' });
});

// Example POST route
app.post('/api/echo', (req, res) => {
  res.json({ youSent: req.body });
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Use PORT from env or default to 3000
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
// server.js
const cors = require('cors');
app.use(cors({ origin: true, credentials: true })); // configure as needed