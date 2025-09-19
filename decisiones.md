# Decisiones de arquitectura y operación

## Aplicación elegida
Seleccionamos **Mini-BI**, una API REST en Node.js + Express que ya incluye lógica de negocio, script ETL y un dashboard React como referencia. Esta combinación nos permite demostrar un flujo completo de backend + datos sin tener que implementar funcionalidades desde cero. La API expone consultas agregadas sobre productos y el ETL descarga información desde Fake Store API para poblar la base.

### Stack tecnológico
- **Runtime:** Node.js 20 (imagen `node:20-alpine`).
- **Framework:** Express 5 con Knex como ORM ligero.
- **Base de datos:** MySQL 8 en contenedor.
- **Cliente opcional:** React + Vite (se mantiene en el repositorio como referencia visual).

Elegimos mantener todo en JavaScript para reducir el tiempo de onboarding del equipo y permitir que tanto el servidor como los scripts ETL compartan dependencias.

## Preparación del repositorio
- Se actualizó `package.json` con scripts (`npm start`, `npm run etl`, `npm run start:with-etl`) para facilitar ejecuciones locales y dentro de contenedores.
- Se creó `.env.example` inventariando todas las variables necesarias: credenciales de MySQL, puertos por entorno, usuario de Docker Hub y parámetros de espera para la base.
- `README.md` documenta el estado inicial, instrucciones de build, publicación y uso de docker-compose para QA/PROD.

## Imagen base y Dockerfile
Utilizamos `node:20-alpine` por ser una versión estable, con soporte LTS y footprint reducido (~80 MB). Esto permite correr Express y Knex sin instalar dependencias extra. El Dockerfile tiene dos etapas:
1. **deps:** ejecuta `npm ci --omit=dev` para instalar dependencias reproducibles de producción.
2. **final:** copia código fuente, dependencias y define el comando `node scripts/startWithEtl.js`.

Justificación de instrucciones principales:
- `WORKDIR /app`: estandariza la ruta de ejecución para scripts y comandos.
- `COPY package*.json` + `npm ci`: aprovecha la caché de Docker, reinstalando dependencias solo cuando cambian los manifests.
- `COPY server/ routes/ db/ etl/ scripts/`: añade únicamente el código requerido en tiempo de ejecución.
- `CMD node scripts/startWithEtl.js`: lanza un orquestador que espera la base, ejecuta el ETL (opcional según `SKIP_ETL`) y finalmente inicia Express.

## Base de datos y persistencia
Se optó por **MySQL 8.4** porque el proyecto ya usaba `mysql2` y la sintaxis SQL es compatible con el ETL existente. Se define un volumen nombrado `db_data` que apunta a `/var/lib/mysql` para asegurar que los datos sobreviven reinicios y recreaciones de contenedores. Un script `docker/mysql/init.sql` crea las bases `mini_bi_qa` y `mini_bi_prod` automáticamente.

## Variables de entorno y diferenciación QA/PROD
La misma imagen se ejecuta dos veces con configuraciones distintas:

| Variable        | QA                                  | PROD                                      | Propósito |
| --------------- | ----------------------------------- | ----------------------------------------- | --------- |
| `APP_ENV`       | `qa`                                | `prod`                                    | Flag de entorno para logs/diagnóstico |
| `API_PORT`      | `QA_API_PORT` (por defecto 3000)    | `PROD_API_PORT` (por defecto 3000)        | Puerto interno de Express |
| `DB_NAME`       | `mini_bi_qa`                        | `mini_bi_prod`                            | Aislar datasets |
| `LOG_LEVEL`     | `debug`                             | `warn`                                    | Ejemplo de parametrización de logging |
| `SKIP_ETL`      | no definido → se ejecuta ETL        | `true`                                    | En PROD evitamos sobreescribir datos |

Los parámetros comunes (`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`) se definen una única vez mediante anclas de YAML. `scripts/waitForDb.js` reutiliza estas variables para esperar hasta que la base responda antes de correr el ETL.

## Orquestación con docker-compose
`docker-compose.yml` levanta tres servicios:
1. `db`: contenedor MySQL con volumen persistente y script de inicialización.
2. `app-qa`: instancia de la imagen `mini-bi` etiquetada como `v1.0`, expuesta en el puerto 3001.
3. `app-prod`: segunda instancia de la misma imagen `v1.0`, expuesta en el puerto 3002.

Ambas apps dependen de la salud de la base (`depends_on.condition: service_healthy`) y comparten el volumen de datos, demostrando persistencia entre reinicios. Se documentó en el README cómo ejecutar `docker compose up -d --build` para reproducir el entorno en cualquier máquina.

## Estrategia de versionado y publicación
- Tag `dev`: builds locales frecuentes utilizados para validar cambios antes de promoverlos.
- Tag `v1.0`: primera versión estable preparada para despliegues. `docker-compose.yml` referencia explícitamente `v1.0` para asegurar que QA y PROD corren la misma build.
- Futuras promociones seguirán semántica `vMAJOR.MINOR` y se documentarán en Docker Hub. La publicación se realiza con `docker push` tras `docker login`.

## Evidencias y pruebas recomendadas
Para la entrega final se sugieren capturas/logs de:
- `docker compose ps` mostrando los tres servicios arriba.
- Respuestas exitosas de `GET /products` en QA y PROD.
- Ejecución del ETL (`docker compose logs app-qa`) y verificación de persistencia (`SELECT COUNT(*) FROM products`).

## Problemas y soluciones
- **Sincronización con la base:** el ETL fallaba si MySQL no estaba listo. Se añadió `scripts/waitForDb.js` y el orquestador `startWithEtl.js` para reintentar la conexión antes de cargar datos.
- **Datos en PROD:** para evitar que el ETL limpie tablas en producción, se introdujo la variable `SKIP_ETL=true` en `app-prod`. Si se necesita inicializar datos se ejecuta `npm run etl` manualmente desde el contenedor.
- **Repositorio remoto desactualizado:** se actualizó la metadata de `package.json` para apuntar al nuevo repositorio (`https://github.com/tu-usuario/Proyecto-Docker-Inge-III`).
