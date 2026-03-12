const express = require('express');
const cors = require('cors');
const app = express();

const { notFound, errorHandler } = require('./src/middleware/error');

app.use(express.json());
app.use(cors({ origin: true, credentials: true }));



app.get('/', (req, res) => {
  res.json({ message: '👌 all loading 👌' });
});

// Seeding SQLite
require("./src/data/structure")
require("./src/data/seeder")


//routing
app.use("/api/books", require("../Backend/src/routes/books"));
app.use("/api/authors", require("../Backend/src/routes/authors"));

//healht check
app.get('/api/health', (req, res) => {
  res.status(200).send('OK');
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});