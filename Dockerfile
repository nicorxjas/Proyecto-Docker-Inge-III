# Stage 1: construir el frontend de React con Vite.
# Se aísla la compilación para que las dependencias de build no lleguen a la imagen final.
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

# Instalar dependencias del frontend usando los manifiestos.
COPY frontend/package*.json ./
RUN npm ci

# Copiar el resto del código del frontend y generar la carpeta dist/.
COPY frontend/ ./
RUN npm run build

# Stage 2: imagen final del backend + estáticos compilados.
# Este stage es el que se ejecutará en QA/PROD.
FROM node:20-alpine AS backend
WORKDIR /usr/src/app

# Instalar únicamente las dependencias necesarias para ejecutar el backend.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copiar el código fuente del backend.
COPY server ./server
COPY routes ./routes
COPY db ./db
COPY etl ./etl
COPY config ./config
COPY README.md ./README.md

# Copiar los archivos estáticos ya construidos del stage anterior.
# Express sirve este directorio (frontend/dist) como archivos públicos.
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Variables de entorno por defecto. La API y el frontend se exponen juntos en este puerto.
ENV NODE_ENV=production \
    API_PORT=3000

# La aplicación (API + estáticos) escucha en el puerto 3000 dentro del contenedor.
EXPOSE 3000

# Ejecutar el backend, que también entrega el frontend generado en dist/.
CMD ["npm", "start"]
