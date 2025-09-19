require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.API_PORT || 3000;
const APP_ENV = process.env.APP_ENV || 'local';
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  if (LOG_LEVEL === 'debug') {
    console.log(`[${APP_ENV}] ${req.method} ${req.originalUrl}`);
  }
  next();
});

const productRoutes = require('../routes/products');
app.use('/products', productRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Servidor (${APP_ENV}, log=${LOG_LEVEL}) escuchando en http://localhost:${PORT}`);
});
