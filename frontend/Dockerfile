# Stage 1 — Builder
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first for layer cache optimization
COPY package.json package-lock.json ./
RUN npm ci

# Copy all source files and build
COPY . .
RUN npm run build
# Result is in /app/dist

# Stage 2 — Final with Nginx
FROM nginx:alpine

# Copy built React app
COPY --from=builder /app/dist /usr/share/nginx/html

# Replace default nginx config with our custom one
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
