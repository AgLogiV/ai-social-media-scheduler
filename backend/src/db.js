require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Може да добавиш SSL или други настройки при нужда
});

module.exports = pool;