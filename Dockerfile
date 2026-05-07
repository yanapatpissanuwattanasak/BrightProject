# check=skip=SecretsUsedInArgOrEnv
# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci --legacy-peer-deps

COPY . .

# Seed all declared vars from .env.example so Vite knows about them (empty defaults)
COPY .env.example .env

ARG VITE_TAT_API_KEY
ENV VITE_TAT_API_KEY=$VITE_TAT_API_KEY

RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
