const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

const query = (text, params) => pool.query(text, params);

const close = () => pool.end();

module.exports = {
  query,
  close,
};