const express = require('express');
const app = express();
const app = require('./app');
app.use(express.json());
const cors = require('cors');
app.use(cors({ origin: true, credentials: true })); 



// Health check
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

//seed
const library = require("./services/library");
app.locals.seed = library.seed();

//routing
app.use("/api/books", require("./routes/books"));
app.use("/api/authors", require("./routes/authors"))

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});

