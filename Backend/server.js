const express = require('express');
const cors = require('cors');
const app = express();
const library = require('../Backend/src/services/library')

app.use(express.json());
app.use(cors({ origin: true, credentials: true }));



app.get('/', (req, res) => {
  res.json({ message: '👌 all loading 👌' });
});

//seeding
app.locals.seed = library.seed();

//routing
app.use("/api/books", require("../Backend/src/routes/books"));
app.use("/api/authors", require("../Backend/src/routes/authors"));

//healht check
app.get('/api/health', (req, res) => {
  res.status(200).send('OK');
});


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});