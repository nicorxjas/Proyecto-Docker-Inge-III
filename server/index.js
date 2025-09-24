const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { loadEnv } = require('../config/env');

loadEnv();

const APP_ENV = (process.env.APP_ENV || 'qa').toLowerCase();
const PORT = Number(process.env.API_PORT) || 3000;
const LOG_LEVEL = (process.env.LOG_LEVEL || 'info').toLowerCase();

const LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };
const LEVEL_TO_CONSOLE = { error: 'error', warn: 'warn', info: 'info', debug: 'log' };

function canLog(level) {
  return (LEVELS[level] ?? LEVELS.info) <= (LEVELS[LOG_LEVEL] ?? LEVELS.info);
}

function log(level, message) {
  const normalized = level.toLowerCase();
  if (!canLog(normalized)) return;
  const method = LEVEL_TO_CONSOLE[normalized] || 'log';
  console[method](`[${normalized.toUpperCase()}][${APP_ENV}] ${message}`);
}

const app = express();
app.use(cors());

if (APP_ENV === 'qa') {
  app.use((req, _res, next) => {
    log('debug', `${req.method} ${req.originalUrl}`);
    next();
  });
}

const productRoutes = require('../routes/products');

// Middleware para parsear JSON
app.use(express.json());


app.get('/health', (_req, res) => {
  res.json({ status: 'ok', environment: APP_ENV, database: process.env.DB_NAME });
});

app.get('/config', (_req, res) => {
  res.json({
    environment: APP_ENV,
    logLevel: LOG_LEVEL,
    autoEtl: process.env.RUN_ETL_ON_BOOT === 'true',
  });
});

// Rutas de productos
app.use('/products', productRoutes);


const frontendDistPath = path.join(__dirname, '../frontend/dist');
const frontendIndexPath = path.join(frontendDistPath, 'index.html');
const hasFrontendBuild = fs.existsSync(frontendIndexPath);

if (hasFrontendBuild) {
  app.use(express.static(frontendDistPath));
  log('info', `🖥️ Sirviendo frontend estático desde ${frontendDistPath}`);

  app.get('/', (_req, res) => {
    res.send(`🚀 Bienvenido! Estás en el entorno ${APP_ENV.toUpperCase()}`);
  });
}

function startServer() {
  return app.listen(PORT, () => {
    log('info', `🚀 Servidor escuchando en http://0.0.0.0:${PORT}`);
  });
}

if (require.main === module) {
  startServer();
}

module.exports = {
  app,
  startServer,
  log,
  APP_ENV,
};
