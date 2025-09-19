const express = require('express');
const router = express.Router();
const db = require('../db/connection');

// 🟢 GET /products → lista todos los productos
router.get('/', async (req, res) => {
  try {
    const products = await db.select('*').from('products');
    res.json(products);
  } catch (err) {
    console.error('Error al obtener productos:', {
      message: err.message,
      code: err.code,
      errno: err.errno,
      sqlState: err.sqlState,
      sqlMessage: err.sqlMessage
    });
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// 🟡 GET /products/categories → resumen por categoría
router.get('/categories', async (req, res) => {
  try {
    const results = await db('products')
      .select('category')
      .count('* as count')
      .groupBy('category');

    res.json(results);
  } catch (err) {
    console.error('Error al obtener productos:', {
      message: err.message,
      code: err.code,
      errno: err.errno,
      sqlState: err.sqlState,
      sqlMessage: err.sqlMessage
    });
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// 🟢 GET /products/price-by-category → total de precios por categoría
router.get('/price-by-category', async (req, res) => {
  try {
    const results = await db('products')
      .select('category')
      .sum('price as totalPrice')
      .groupBy('category');

    res.json(results);
  } catch (err) {
    console.error('Error al obtener precios por categoría:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});


// 🟢 GET /products/categories/summary → total y porcentaje por categoría
router.get('/categories/summary', async (req, res) => {
  try {
    const results = await db('products')
      .select('category')
      .sum('price as total')
      .groupBy('category');

    const totalGlobal = results.reduce((acc, row) => acc + Number(row.total), 0);

    const enriched = results.map(row => ({
      category: row.category,
      total: Number(row.total),
      percentage: totalGlobal > 0 ? Number((row.total / totalGlobal) * 100).toFixed(2) : 0
    }));

    res.json(enriched);
  } catch (err) {
    console.error('Error al obtener resumen de precios por categoría:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// 🟢 GET /products/:id → producto por ID
router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'ID inválido' });
  }

  try {
    const product = await db('products').where({ id }).first();
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ error: 'Producto no encontrado' });
    }
  } catch (err) {
    console.error('Error al obtener producto:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});


module.exports = router;
