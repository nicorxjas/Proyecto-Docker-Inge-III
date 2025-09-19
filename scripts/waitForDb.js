const mysql = require('mysql2/promise');
require('dotenv').config();

const host = process.env.DB_HOST || 'localhost';
const port = Number(process.env.DB_PORT || 3306);
const user = process.env.DB_USER || 'root';
const password = process.env.DB_PASSWORD || '';
const database = process.env.DB_NAME;
const retries = Number(process.env.DB_WAIT_RETRIES || 30);
const delayMs = Number(process.env.DB_WAIT_DELAY || 2000);

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForDb() {
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      const connection = await mysql.createConnection({ host, port, user, password });
      if (database) {
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\``);
        await connection.changeUser({ database });
      }
      await connection.ping();
      await connection.end();
      console.log(`✅ Base de datos disponible (intento ${attempt}).`);
      return;
    } catch (error) {
      console.log(`⏳ Esperando base de datos (intento ${attempt}/${retries}): ${error.message}`);
      await sleep(delayMs);
    }
  }
  throw new Error(`No se pudo conectar a la base de datos en ${retries} intentos.`);
}

waitForDb().catch((error) => {
  console.error('❌ Error al esperar la base de datos:', error);
  process.exit(1);
});
