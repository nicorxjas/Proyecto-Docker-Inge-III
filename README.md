# Mini-BI - Entorno QA/PROD con Docker

Este proyecto empaqueta una API de analítica desarrollada en Node.js, su proceso ETL y una base de datos MySQL dentro de una arquitectura de contenedores capaz de operar en paralelo en QA y en producción reutilizando una única imagen.

## Arquitectura general

- **Orquestación:** `docker-compose.yml` define una red interna y coordina los servicios `database`, `app-qa` y `app-prod`.
- **Base de datos:** contenedor MySQL 8 que inicializa los esquemas `dashboard_qa` y `dashboard_prod` mediante scripts en `db/init` y persiste la información en el volumen `mysql_data`.
- **Backend:** API REST en `server/index.js` basada en Express y Knex. El arranque pasa por `server/bootstrap.js`, que espera el estado saludable de la base, ejecuta el ETL y expone el servicio HTTP.
- **ETL:** `etl/fetchAndLoad.js` obtiene datos desde la API pública FakeStore y los carga en la tabla `products`, diferenciando el destino por la variable `DB_NAME`.
- **Frontend:** aplicación React (Vite) en `frontend/` preparada para consumir los endpoints expuestos por la API.

## Requisitos previos

- Docker 24 o superior y Docker Compose V2.
- Cuenta en Docker Hub si se desea publicar la imagen.
- Puertos disponibles en el host: `3001`, `3002` y `3307`.

## Paso a paso para usar la aplicación

1. **Construir la imagen** (reemplaza `<usuario>` si vas a publicarla):
   ```bash
   docker build -t <usuario>/mini-bi:qa .
   docker tag <usuario>/mini-bi:qa <usuario>/mini-bi:v1.0
   ```
2. **Publicar la imagen** (opcional, solo si trabajas con Docker Hub):
   ```bash
   docker login
   docker push <usuario>/mini-bi:qa
   docker push <usuario>/mini-bi:v1.0
   ```
3. **Actualizar el Compose**: verifica que la imagen referenciada en `docker-compose.yml` coincide con el tag que usarás (por defecto `mini-bi-app:v1.0`).
4. **Levantar los servicios**: `docker compose up -d --build`. Este comando inicia la base de datos, espera el health-check y luego crea los contenedores QA y PROD ejecutando el ETL automáticamente.
5. **Verificar el estado**:
   - QA en http://localhost:3001
   - PROD en http://localhost:3002
   - Endpoints útiles: `/health`, `/config`, `/products`, `/products/categories` y `/products/price-by-category`.
6. **Conectarse a la base de datos** (opcional) utilizando cualquier cliente MySQL en `127.0.0.1:3307` con usuario `root` y contraseña `supersecret`.
7. **Detener los contenedores** con `docker compose down`. Omite la bandera `-v` para conservar los datos del volumen.

## Variables de entorno relevantes

| Variable | QA | PROD | Descripción |
|----------|----|------|-------------|
| `APP_ENV` | `qa` | `prod` | Ajusta mensajes y metadatos de respuesta. |
| `LOG_LEVEL` | `debug` | `warn` | Controla el detalle de los logs. |
| `DB_NAME` | `dashboard_qa` | `dashboard_prod` | Selecciona el esquema activo. |
| `RUN_ETL_ON_BOOT` | `true` | `true` | Ejecuta el ETL al iniciar el contenedor. |
| `DB_HOST` | `database` | `database` | Alias interno que apunta al contenedor MySQL. |
| `DB_USER` / `DB_PASSWORD` | `root` / `supersecret` | `root` / `supersecret` | Credenciales compartidas entre entornos. |

Estas variables se definen en `docker-compose.yml`. Si deseas cargarlas desde un `.env`, establece `SKIP_DOTENV=true` para evitar sobreescrituras dentro del contenedor.

## Acceso a la información

- **Aplicación QA:** http://localhost:3001
- **Aplicación PROD:** http://localhost:3002
- **Base de datos:** puerto `3307` del host, con persistencia en `mysql_data`.

La documentación complementaria y evidencias de ejecución se encuentran en `docs/`.
