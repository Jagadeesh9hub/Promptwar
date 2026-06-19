# syntax=docker/dockerfile:1

# ---- Build stage: compile the Vite app ----
FROM node:20-alpine AS build
WORKDIR /app
# Install from the lockfile for reproducible builds.
COPY package.json package-lock.json ./
RUN npm ci
# Build (runs `tsc --noEmit && vite build`).
COPY . .
RUN npm run build

# ---- Runtime stage: serve the static build with nginx ----
FROM nginx:1.27-alpine AS runtime
# Cloud Run sends traffic to $PORT (default 8080); nginx is configured to listen on 8080.
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
