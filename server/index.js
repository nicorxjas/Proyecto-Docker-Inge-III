require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.API_PORT || 3000;
const APP_ENV = process.env.APP_ENV || 'local';
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

app.use(cors());
app.use(express.json());

// Middleware de logs
app.use((req, res, next) => {
  if (LOG_LEVEL === 'debug') {
    console.log(`[${APP_ENV}] ${req.method} ${req.originalUrl}`);
  }
  next();
});


// 👉 Servir frontend (si el build existe)
const staticDir = path.join(__dirname, '..', 'frontend', 'dist');
const indexHtmlPath = path.join(staticDir, 'index.html');
const hasFrontendBuild = fs.existsSync(indexHtmlPath);

if (hasFrontendBuild) {
  app.use(express.static(staticDir));
} else {
  console.warn('⚠️  Build del frontend no encontrado. Solo se servirá la API.');
}


// Rutas API
const productRoutes = require('../routes/products');
app.use('/products', productRoutes);

// Healthcheck
app.get('/health', (req, res) => res.status(200).send('OK'));

// Fallback SPA (React Router)
if (hasFrontendBuild) {
  app.get('/*', (req, res) => {
    res.sendFile(indexHtmlPath);
  });
}

app.listen(PORT, () => {
  console.log(`🚀 Servidor (${APP_ENV}, log=${LOG_LEVEL}) escuchando en http://localhost:${PORT}`);
});
