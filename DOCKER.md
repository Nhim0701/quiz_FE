# Docker Setup Guide for Quiz Frontend

This guide provides step-by-step instructions for containerizing the Quiz Frontend React application.

## Prerequisites

- Docker installed on your machine ([Install Docker](https://docs.docker.com/get-docker/))
- Docker Compose (optional, for easier management)

## Project Overview

- **Framework**: React 19 with Vite 7
- **Styling**: Tailwind CSS 4
- **Build Output**: Static files served via Nginx

---

## Step 1: Create Dockerfile

Create a `Dockerfile` in the project root (`quiz_FE/`):

```dockerfile
# Stage 1: Build the application
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine AS production

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
```

---

## Step 2: Create Nginx Configuration

Create `nginx.conf` in the project root:

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml application/javascript;

    # Handle React Router (SPA routing)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy to backend
    location /api {
        proxy_pass http://backend:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

---

## Step 3: Create .dockerignore

Create `.dockerignore` to exclude unnecessary files:

```
node_modules
dist
.git
.gitignore
*.md
.env*
.vscode
.idea
*.log
npm-debug.log*
.DS_Store
coverage
```

---

## Step 4: Build the Docker Image

```bash
# Navigate to the project directory
cd quiz_FE

# Build the image
docker build -t quiz-frontend:latest .

# Or with a specific tag
docker build -t quiz-frontend:1.0.0 .
```

---

## Step 5: Run the Container

### Option A: Standalone Container

```bash
# Run the container
docker run -d \
  --name quiz-frontend \
  -p 3000:80 \
  quiz-frontend:latest

# Access the app at http://localhost:3000
```

### Option B: With Backend API Proxy

If you need to connect to a backend running on your host machine:

```bash
# Linux
docker run -d \
  --name quiz-frontend \
  -p 3000:80 \
  --add-host=host.docker.internal:host-gateway \
  quiz-frontend:latest

# macOS/Windows (host.docker.internal works by default)
docker run -d \
  --name quiz-frontend \
  -p 3000:80 \
  quiz-frontend:latest
```

Update `nginx.conf` to use `host.docker.internal` instead of `backend`:
```nginx
location /api {
    proxy_pass http://host.docker.internal:8000;
    # ... rest of config
}
```

---

## Step 6: Docker Compose Setup (Recommended)

Create `docker-compose.yml` for easier management:

```yaml
version: '3.8'

services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: quiz-frontend
    ports:
      - "3000:80"
    depends_on:
      - backend
    networks:
      - quiz-network
    restart: unless-stopped

  backend:
    build:
      context: ../quiz
      dockerfile: Dockerfile
    container_name: quiz-backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/quiz_db
    depends_on:
      - db
    networks:
      - quiz-network
    restart: unless-stopped

  db:
    image: postgres:15-alpine
    container_name: quiz-db
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=quiz_db
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - quiz-network
    restart: unless-stopped

networks:
  quiz-network:
    driver: bridge

volumes:
  postgres_data:
```

### Run with Docker Compose

```bash
# Build and start all services
docker-compose up -d --build

# View logs
docker-compose logs -f frontend

# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

---

## Step 7: Environment Variables (Optional)

For environment-specific builds, create a `.env` file:

```bash
# .env.production
VITE_API_URL=https://api.yourproduction.com
```

Update the Dockerfile to use build args:

```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Accept build arguments
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine AS production
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Build with environment variable:

```bash
docker build \
  --build-arg VITE_API_URL=https://api.production.com \
  -t quiz-frontend:production .
```

---

## Common Commands Reference

```bash
# Build image
docker build -t quiz-frontend .

# Run container
docker run -d --name quiz-frontend -p 3000:80 quiz-frontend

# View running containers
docker ps

# View logs
docker logs quiz-frontend
docker logs -f quiz-frontend  # Follow logs

# Stop container
docker stop quiz-frontend

# Remove container
docker rm quiz-frontend

# Remove image
docker rmi quiz-frontend

# Access container shell
docker exec -it quiz-frontend /bin/sh

# Rebuild without cache
docker build --no-cache -t quiz-frontend .
```

---

## Troubleshooting

### 1. Build Fails with npm ci

If `package-lock.json` doesn't exist:

```dockerfile
# Change this line
RUN npm ci
# To this
RUN npm install
```

### 2. API Calls Not Working

- Check if backend is running and accessible
- Verify the proxy configuration in `nginx.conf`
- Check Docker network connectivity

```bash
# Test from inside container
docker exec -it quiz-frontend /bin/sh
wget -qO- http://backend:8000/health
```

### 3. React Router 404 Errors

Ensure nginx.conf has the SPA fallback:

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

### 4. Permission Issues

If you encounter permission errors:

```dockerfile
# Add after COPY commands in nginx stage
RUN chown -R nginx:nginx /usr/share/nginx/html
```

---

## Production Checklist

- [ ] Use specific Node.js version tag (e.g., `node:20.10-alpine`)
- [ ] Use specific Nginx version tag (e.g., `nginx:1.25-alpine`)
- [ ] Set up health checks
- [ ] Configure proper logging
- [ ] Use secrets management for sensitive data
- [ ] Set up SSL/TLS termination
- [ ] Configure rate limiting
- [ ] Set appropriate resource limits

### Health Check Example

Add to Dockerfile:

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1
```

---

## File Structure After Setup

```
quiz_FE/
├── Dockerfile
├── docker-compose.yml
├── nginx.conf
├── .dockerignore
├── package.json
├── vite.config.js
└── src/
    └── ...
```
