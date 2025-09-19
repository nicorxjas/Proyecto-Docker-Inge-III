require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

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

// Rutas API
const productRoutes = require('../routes/products');
app.use('/products', productRoutes);

// Healthcheck
app.get('/health', (req, res) => res.status(200).send('OK'));

// 👉 Servir frontend
const staticDir = path.join(__dirname, '..', 'frontend', 'dist');
app.use(express.static(staticDir));

// Fallback SPA (React Router)
app.get('*', (req, res) => {
  res.sendFile(path.join(staticDir, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor (${APP_ENV}, log=${LOG_LEVEL}) escuchando en http://localhost:${PORT}`);
});
