const axios = require('axios');
const db = require('../db/connection');

async function runETL() {
  try {
    // 1. Crear la tabla si no existe
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

    // 2. Extraer los datos
    const response = await axios.get('https://fakestoreapi.com/products');
    const rawData = response.data;

    // 3. Transformar los datos
    const transformed = rawData.map(p => ({
      title: p.title,
      price: Math.round(p.price * 100) / 100,
      category: p.category.trim().toLowerCase(),
      description: p.description,
      image: p.image,
    }));

    // 4. Limpiar y cargar
    await db('products').del(); // Opcional: limpiar antes de insertar
    await db('products').insert(transformed);

    console.log(`✅ ETL completado: se cargaron ${transformed.length} productos.`);
    process.exit(0); // Cierra el proceso
  } catch (err) {
    console.error('❌ Error en ETL:', err);
    process.exit(1);
  }
}

runETL();
