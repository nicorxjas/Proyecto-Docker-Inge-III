# Mini-BI containerizado

Mini-BI es una API REST construida con **Node.js + Express + Knex + MySQL** que expone indicadores de productos y un script ETL que inicializa la base con datos de Fake Store API. Este repositorio contiene todo lo necesario para ejecutar la aplicación en contenedores Docker y levantar entornos diferenciados de QA y PROD usando la **misma imagen**.

## Estructura del repositorio

```
.
├── db/                   # Configuración de Knex y conexión a MySQL
├── docker/
│   └── mysql/init.sql    # Script para crear las bases QA/PROD
├── docker-compose.yml    # Orquestación de QA, PROD y DB
├── etl/                  # Script ETL para poblar la base
├── frontend/             # Dashboard React (referencia)
├── routes/               # Endpoints de Express
├── scripts/              # Utilidades para levantar la app en contenedor
├── server/               # Servidor Express
├── Dockerfile            # Imagen de la API/ETL
├── decisiones.md         # Justificación de decisiones
├── .env.example          # Variables de entorno esperadas
└── README.md             # Este archivo
```

## Prerrequisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) o Docker Engine 24+
- [Docker Compose](https://docs.docker.com/compose/) v2 (incluido en Docker Desktop)
- Cuenta en [Docker Hub](https://hub.docker.com/) para publicar la imagen

## Variables de entorno

Copia `.env.example` a `.env` y ajusta los valores según tus necesidades:

```bash
cp .env.example .env
```

Variables principales:

| Variable                | Descripción                                                             |
| ----------------------- | ----------------------------------------------------------------------- |
| `DOCKERHUB_USER`        | Usuario de Docker Hub utilizado para etiquetar la imagen                |
| `IMAGE_NAME`            | Nombre base de la imagen                                                |
| `DB_PASSWORD`           | Contraseña del usuario root en MySQL                                    |
| `QA_DB_NAME` / `PROD_DB_NAME` | Nombres de las bases de datos para cada entorno                    |
| `QA_API_PORT` / `PROD_API_PORT` | Puerto interno que expone Express (se publica como 3001/3002) |
| `QA_LOG_LEVEL` / `PROD_LOG_LEVEL` | Nivel de log deseado por entorno                            |

> El resto de variables controlan los tiempos de espera del contenedor hasta que la base esté disponible.

## Construir la imagen de la aplicación

La imagen contiene la API y el script ETL. Se recomienda etiquetar una versión de desarrollo y una estable:

```bash
# Build de desarrollo
DOCKERHUB_USER=tu-usuario IMAGE_NAME=mini-bi \
docker build -t "$DOCKERHUB_USER/$IMAGE_NAME:dev" .

# Etiqueta estable v1.0
docker tag "$DOCKERHUB_USER/$IMAGE_NAME:dev" "$DOCKERHUB_USER/$IMAGE_NAME:v1.0"
```

### Publicar la imagen en Docker Hub

```bash
docker login

docker push "$DOCKERHUB_USER/$IMAGE_NAME:dev"
docker push "$DOCKERHUB_USER/$IMAGE_NAME:v1.0"
```

## Levantar QA y PROD con docker-compose

```bash
# Construye (si no existe) y levanta los contenedores en segundo plano
docker compose up -d --build

# Ver logs en vivo
docker compose logs -f app-qa app-prod
```

Servicios expuestos:

| Servicio  | URL                      | Descripción                                    |
| --------- | ------------------------ | ---------------------------------------------- |
| QA        | http://localhost:3001    | API QA (carga datos automáticamente con ETL)   |
| PROD      | http://localhost:3002    | API PROD (requiere carga manual inicial)       |
| Base de datos | localhost:3306 (MySQL) | Usuario `root`, contraseña `DB_PASSWORD`     |

### Verificar la aplicación

1. **Consultar productos (QA):** `curl http://localhost:3001/products`
2. **Resumen por categoría (QA):** `curl http://localhost:3001/products/categories`
3. **Conexión a la base:**
   ```bash
   mysql -h 127.0.0.1 -P 3306 -u root -p$DB_PASSWORD -e "USE mini_bi_qa; SELECT COUNT(*) FROM products;"
   ```
4. **Persistencia:** reinicia los servicios (`docker compose restart app-qa`) y vuelve a consultar; los datos permanecen gracias al volumen `db_data`.

Si deseás cargar datos iniciales en PROD, ejecutá el ETL manualmente dentro del contenedor:

```bash
docker compose exec app-prod npm run etl
```

## Desarrollo local sin Docker

1. Instala dependencias:
   ```bash
   npm install
   ```
2. Define un archivo `.env` con credenciales de MySQL locales.
3. Ejecuta el ETL y el servidor:
   ```bash
   npm run etl
   npm start
   ```

## Publicación y versiones

- `:dev`: imagen de trabajo utilizada para validaciones locales y pruebas.
- `:v1.0`: versión estable promovida una vez validados QA y PROD. El `docker-compose.yml` consume esta etiqueta para asegurar reproducibilidad.

Actualizá el tag estable cada vez que publiques una nueva versión lista para despliegue (por ejemplo `v1.1`, `v2.0`, etc.).

## Evidencias sugeridas

Guarda en `evidencias/` capturas de los contenedores en ejecución, respuestas de la API y logs de conexión a la base. Referencia estas evidencias desde `decisiones.md` para demostrar el funcionamiento.

## Soporte y contribución

1. Forkea el repositorio.
2. Crea una rama con tu feature/fix.
3. Envía un Pull Request describiendo los cambios.

Para dudas o mejoras, abrí un issue en el repositorio.
