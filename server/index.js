const express = require('express');
const app = express();
const PORT = process.env.API_PORT || 3000;

const cors = require('cors');
app.use(cors());

const productRoutes = require('../routes/products');

// Middleware para parsear JSON
app.use(express.json());

// Usar las rutas
app.use('/products', productRoutes);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
});
