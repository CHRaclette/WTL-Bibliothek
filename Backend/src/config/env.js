require('dotenv').config();
const path = require('path');

const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  dataDir: path.resolve(process.cwd(), process.env.DATA_DIR || './src/data'),
  booksFile: process.env.BOOKS_FILE || 'books.json'
};

module.exports = config;
