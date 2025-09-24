const knex = require('knex');
const { loadEnv } = require('../config/env');

loadEnv();

const db = knex({
  client: 'mysql2',
  connection: {
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'dashboard_qa',
  },
  pool: {
    min: 0,
    max: Number(process.env.DB_POOL_MAX || 5),
  },
});

module.exports = db;
