const axios = require('axios');
const db = require('../db/connection');

async function runETL() {
  try {
    const exists = await db.schema.hasTable('products');
    if (!exists) {
      await db.schema.createTable('products', (table) => {
        table.increments('id').primary();
        table.string('title');
        table.float('price');
        table.string('category');
        table.text('description');
        table.string('image');
        table.timestamp('loaded_at').defaultTo(db.fn.now());
      });
      console.log('✅ Tabla creada');
    }

    const response = await axios.get('https://fakestoreapi.com/products');
    const rawData = response.data;

    const transformed = rawData.map((p) => ({
      title: p.title,
      price: Math.round(p.price * 100) / 100,
      category: p.category.trim().toLowerCase(),
      description: p.description,
      image: p.image,
    }));

    await db('products').del();
    await db('products').insert(transformed);

    console.log(`✅ ETL completado: se cargaron ${transformed.length} productos.`);
  } finally {
    await db.destroy();
  }
}

if (require.main === module) {
  runETL()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('❌ Error en ETL:', error);
      process.exit(1);
    });
}

module.exports = { runETL };
