# Etapa base para instalar dependencias de producción
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Imagen final
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production \
    API_PORT=3000

COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json ./
COPY server ./server
COPY routes ./routes
COPY db ./db
COPY etl ./etl
COPY scripts ./scripts

EXPOSE 3000
CMD ["node", "scripts/startWithEtl.js"]
