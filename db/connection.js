require('dotenv').config();
const knex = require('knex');

const db = knex({
  client: 'mysql2',
  connection: {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },
  pool: {
    min: 0,
    max: 10,
    afterCreate: (conn, done) => {
      conn.query('SET SESSION sql_mode = "STRICT_TRANS_TABLES"', (err) => {
        done(err, conn);
      });
    },
  },
});

module.exports = db;
