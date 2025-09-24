# Decisiones de Arquitectura y Dockerización

## 1. Panorama general del alcance
- Se analizó la estructura completa del repositorio (`frontend/`, `server/`, `routes/`, `db/`, `etl/`, `config/`, `docs/`) para determinar cómo empaquetar una solución ejecutable end-to-end.
- Se optó por entregar una única imagen capaz de servir la API de Node/Express y los assets del frontend ya compilado, eliminando la necesidad de administrar dos contenedores separados para QA/PROD.
- Se mantuvieron fuera de la imagen final únicamente los archivos de soporte (por ejemplo `docs/`) que no son necesarios en tiempo de ejecución.

## 2. Construcción de la imagen (Dockerfile)
- Se eligió `node:20-alpine` como base para ambos stages por ser la versión LTS más reciente y ofrecer un runtime ligero.
- Se definió un build multi-stage:
  - **Stage `frontend-builder`**: instala dependencias con `npm ci`, compila el dashboard de Vite y deja los estáticos en `dist/`.
  - **Stage `backend`**: instala sólo dependencias productivas del backend con `npm ci --omit=dev`, copia `server/`, `routes/`, `db/`, `etl/`, `config/` y el `README.md`, y finalmente copia los archivos estáticos del stage previo hacia `frontend/dist`.
- Se estableció `WORKDIR /usr/src/app` para el stage final y se expuso el puerto `3000`, alineado con `API_PORT`.
- El `CMD` quedó en `npm start`, el cual invoca `server/bootstrap.js` para realizar comprobaciones y arrancar la API.

## 3. Integración del frontend en la imagen
- Express sirve el contenido precompilado desde `frontend/dist` (ver `server/index.js`), lo que permite que la misma imagen atienda las rutas API y los assets estáticos.
- El cliente HTTP (`frontend/src/services/apiClient.js`) resuelve la URL base usando `VITE_API_BASE_URL`, el modo `DEV` o el `window.location.origin`, lo que facilita apuntar al backend dentro o fuera de Docker.
- Los componentes principales (`ProductTable.jsx`, `CategoryCards.jsx`, `CategoryDonutChart.jsx`) realizan peticiones reales a `/products` y `/products/categories`, comprobando que el dashboard consume datos persistidos en MySQL y no mocks en memoria.

## 4. Orquestación con Docker Compose
- `docker-compose.yml` crea un servicio de base de datos (`mysql:8.0`) y dos instancias de la API (`app-qa`, `app-prod`) reutilizando la misma imagen `mini-bi-app:v1.0`.
- Se centralizó la configuración común mediante anclas (`x-app-image`, `x-app-environment`) para evitar duplicación de variables (`API_PORT`, `RUN_ETL_ON_BOOT`, `DB_HOST`, etc.).
- Cada servicio API publica un puerto distinto (`3001` para QA, `3002` para PROD) y se conectan a la base mediante el hostname `database` provisto por Docker Compose.
- Se montó `./db/init` como volumen de solo lectura para inicializar los esquemas (`dashboard_qa`, `dashboard_prod`).
- `depends_on` con la condición `service_healthy` garantiza que el backend sólo arranque cuando MySQL responde al `healthcheck` (`mysqladmin ping`).

## 5. Gestión de variables de entorno y configuración
- `config/env.js` replica la funcionalidad básica de `dotenv` respetando la bandera `SKIP_DOTENV`, lo cual permite cargar `.env` en desarrollo pero omitirlo dentro del contenedor.
- Se estandarizaron variables como `APP_ENV`, `LOG_LEVEL`, `DB_NAME`, `RUN_ETL_ON_BOOT`, `FAIL_ON_ETL_ERROR` para parametrizar el comportamiento de QA/PROD sin reconstruir imágenes.
- El endpoint `/config` expone información operacional (entorno, nivel de logs, ejecución del ETL) para facilitar diagnósticos post-deploy.

## 6. Inicialización y robustez del backend
- `server/bootstrap.js` valida la conexión MySQL con reintentos antes de levantar Express, reduciendo fallos en escenarios donde la base demora en iniciar.
- Antes de servir peticiones se ejecuta condicionalmente el ETL (`RUN_ETL_ON_BOOT='true'`) y se permite abortar (`FAIL_ON_ETL_ERROR='true'`) si la carga falla.
- `server/index.js` habilita CORS, expone `/health` y loggea en consola con distintos niveles configurables, lo que ayuda a monitorear las instancias containerizadas.

## 7. Pipeline ETL y persistencia de datos
- `etl/fetchAndLoad.js` consume la API pública `https://fakestoreapi.com/products`, transforma los registros y los inserta en la tabla `products`, asegurando que la información presentada sea real y fresca.
- El script crea la tabla `products` en caso de no existir y limpia los datos previos antes de insertar, garantizando idempotencia entre reinicios.
- `db/connection.js` utiliza `mysql2` y lee las credenciales desde el entorno, permitiendo apuntar a distintas bases con la misma imagen.
- `db/init/01-init.sql` prepara los esquemas `dashboard_qa` y `dashboard_prod`; el volumen `mysql_data` conserva la data entre corridas.

## 8. Estrategia de imágenes y despliegue
- Se acordó etiquetar la imagen como `mini-bi-app:v1.0` (más alias como `qa`/`prod` si se publica en un registry) para alinear pipelines automatizados.
- El flujo recomendado es: `docker compose build`, `docker compose up` para validar, y luego `docker push` con las etiquetas definitivas.
- Documentar los puertos expuestos en host (`3307`, `3001`, `3002`) evita conflictos con otros servicios locales durante pruebas.

## 9. Consideraciones adicionales
- No se empaquetan artefactos de pruebas ni dependencias de desarrollo, lo que reduce la superficie de ataque y el peso de la imagen.
- Se recomienda no ejecutar `docker compose down -v` en entornos de QA si se desea preservar el dataset persistido por el ETL.
- Los logs diferenciados por `APP_ENV` permiten auditar desde qué entorno provienen los mensajes cuando múltiples contenedores comparten el mismo host.
