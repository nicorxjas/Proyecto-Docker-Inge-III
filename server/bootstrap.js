const { loadEnv } = require('../config/env');
const db = require('../db/connection');
const { startServer, log } = require('./index');
const { runETL } = require('../etl/fetchAndLoad');

loadEnv();

async function ensureDatabaseConnection(retries = 10, delayMs = 3000) {
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      await db.raw('SELECT 1');
      log('info', '✅ Conexión a la base de datos exitosa.');
      return;
    } catch (error) {
      log('warn', `Intento ${attempt} de ${retries} para conectar con la base de datos falló: ${error.message}`);
      if (attempt === retries) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

async function bootstrap() {
  await ensureDatabaseConnection();

  if (process.env.RUN_ETL_ON_BOOT === 'true') {
    log('info', 'Ejecutando proceso ETL antes de iniciar la API...');
    try {
      await runETL();
    } catch (error) {
      log('error', `Error al ejecutar el ETL: ${error.message}`);
      if (process.env.FAIL_ON_ETL_ERROR === 'true') {
        throw error;
      }
    }
  } else {
    log('info', 'RUN_ETL_ON_BOOT=false, omitiendo ETL automático.');
  }

  startServer();
}

bootstrap().catch((err) => {
  log('error', `La aplicación no pudo iniciar: ${err.message}`);
  process.exit(1);
});
