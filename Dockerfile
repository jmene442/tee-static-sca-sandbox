# Stage 1: Build frontend with Vite
FROM node:18-alpine AS frontend
WORKDIR /app
COPY frontend/package*.json ./frontend/
COPY frontend/ ./frontend
WORKDIR /app/frontend
RUN npm install && npm run build

# Stage 2: Setup backend and serve built frontend
FROM node:18-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm install --omit=dev
COPY backend/ ./
COPY --from=frontend /app/frontend/dist ./public
EXPOSE 3001
CMD ["node", "index.js"]
