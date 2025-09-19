# ----------------------
# Etapa 1: Build frontend
# ----------------------
FROM node:18-alpine AS build-frontend

WORKDIR /app/frontend

# Copiamos TODO el código del frontend (incluye vite.config.js, configs, src, etc.)
COPY frontend/ ./

# Instalamos dependencias y compilamos
RUN npm ci
RUN npm run build


# ----------------------
# Etapa 2: Backend + servir estáticos
# ----------------------
FROM node:18-alpine

WORKDIR /app

# Copiamos dependencias del backend
COPY package*.json ./
RUN npm ci --omit=dev

# Copiamos el código del backend
COPY server ./server
COPY routes ./routes
COPY db ./db

# Copiamos el build del frontend desde la etapa 1
COPY --from=build-frontend /app/frontend/dist ./frontend/dist

ENV API_PORT=3000 APP_ENV=prod LOG_LEVEL=info

EXPOSE 3000

CMD ["node", "server/index.js"]
