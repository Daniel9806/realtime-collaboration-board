# syntax=docker/dockerfile:1

FROM node:22-alpine AS build

WORKDIR /app

# Frontend deps + build
COPY frontend/package.json frontend/package-lock.json ./frontend/
RUN cd frontend && npm ci

COPY frontend ./frontend
RUN cd frontend && npm run build

# Backend deps
COPY backend/package.json backend/package-lock.json ./backend/
RUN cd backend && npm ci

COPY backend ./backend


FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/backend ./backend
COPY --from=build /app/frontend/dist ./frontend/dist

EXPOSE 8080

CMD ["node", "backend/server.js"]
