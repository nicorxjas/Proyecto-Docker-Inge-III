# Mini-BI - Auditoría End-to-End y Documentación

## Arquitectura General

**Backend (Node.js + Express + Knex + MySQL):**
- API RESTful en `server/index.js` usando Express.
- Conexión a MySQL con Knex (`db/connection.js`).
- ETL (`etl/fetchAndLoad.js`) para extraer, transformar y cargar datos en la tabla `products`.
- Rutas en `routes/products.js` para consultar productos y resúmenes por categoría.

**Frontend (React + Vite):**
- Ubicado en `frontend/src`, con componentes para tablas y gráficos.
- Los gráficos (ej. `CategoryDonutChart.jsx`).

---

## Flujo de Datos

1. **Carga de datos (ETL):**
	- Ejecuta el script ETL para poblar la base de datos con productos.
	- Los datos se almacenan en la tabla `products`.

2. **API REST:**
	- Endpoints principales:
	  - `/products` (todos los productos)
	  - `/products/categories` (resumen por categoría)
	  - `/products/price-by-category` (total de precios por categoría)

3. **Consumo en el Frontend:**
	- El frontend debe realizar peticiones HTTP (fetch/axios) a estos endpoints para obtener los datos y alimentar los gráficos.
	- Actualmente, los componentes usan datos estáticos, pero pueden adaptarse fácilmente para consumir datos dinámicos desde la API.

---

## Recomendaciones y Futuro

- **Integración Dinámica:** Modificar los componentes del frontend para consumir datos reales desde la API usando `fetch` o `axios`.
- **Seguridad:** No exponer credenciales sensibles en el código (usar variables de entorno).
- **Escalabilidad:** Modularizar aún más el ETL y las rutas para soportar nuevos tipos de datos y visualizaciones.
- **Documentación:** Mantener actualizado el README con instrucciones de instalación, uso y arquitectura.

---

## Instalación y Uso Rápido

1. Instala dependencias en backend y frontend:
	```sh
	cd Web-Dashboard
	npm install
	cd frontend
	npm install
	```
2. Configura la base de datos MySQL y credenciales en `.env`.
3. Ejecuta el ETL:
	```sh
	node etl/fetchAndLoad.js
	```
4. Inicia el servidor backend:
	```sh
	node server/index.js
	```
5. Inicia el frontend:
	```sh
	npm run dev
	```

---

## Contacto y Contribución

Para dudas, sugerencias o contribuciones, abre un issue o pull request.

---

## Instrucciones Detalladas para CODEX: Consumo de Datos Reales y Variables de Entorno

### 1. Uso de Variables de Entorno

1. Instala el paquete `dotenv` en el backend:
	```sh
	npm install dotenv
	```
2. Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido (ajusta según tu configuración):
	```env
	DB_HOST=localhost
	DB_USER=root
	DB_PASSWORD=TU_PASSWORD
	DB_NAME=MINIBM
	API_PORT=3000
	```
3. Modifica `db/connection.js` para leer las variables de entorno:
	```js
	require('dotenv').config();
	const knex = require('knex');
	const db = knex({
	  client: 'mysql2',
	  connection: {
		 host: process.env.DB_HOST,
		 user: process.env.DB_USER,
		 password: process.env.DB_PASSWORD,
		 database: process.env.DB_NAME,
	  }
	});
	module.exports = db;
	```
4. Modifica `server/index.js` para usar el puerto de la variable de entorno:
	```js
	const PORT = process.env.API_PORT || 3000;
	```

### 2. Consumo de Datos Reales en los Gráficos del Frontend

1. Instala `axios` en el frontend:
	```sh
	cd frontend
	npm install axios
	```
2. Modifica el componente de gráfico (ejemplo: `CategoryDonutChart.jsx`) para consumir datos reales:
	- Reemplaza los datos mockeados por una llamada a la API usando `axios` y React hooks (`useEffect`, `useState`).
	- Ejemplo:
	```jsx
	import { useEffect, useState } from 'react';
	import axios from 'axios';
	// ...importaciones de recharts y otros...

	const CategoryDonutChart = () => {
	  const [data, setData] = useState([]);
	  useEffect(() => {
		 axios.get('http://localhost:3000/products/categories')
			.then(res => setData(res.data))
			.catch(err => console.error(err));
	  }, []);
	  // ...renderizado del gráfico usando 'data'...
	};
	```
	- Adapta el renderizado del gráfico para usar la estructura de datos recibida desde la API.

3. Si necesitas consumir otros endpoints (ej. precios por categoría), repite el proceso cambiando la URL.

### 3. Buenas Prácticas

- No subir el archivo `.env` al repositorio (agrega a `.gitignore`).
- Documenta los endpoints y la estructura esperada de los datos en el README.
- Usa variables de entorno también en el frontend si usas Vite (prefijo `VITE_`).

---

**Con estas instrucciones, CODEX podrá adaptar el proyecto para consumir datos reales en los gráficos y mejorar la seguridad usando variables de entorno.**