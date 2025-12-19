# Stage 1: Build FE
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Serve static bằng một server nhẹ (optional) hoặc leave container tĩnh
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist

# Nếu muốn dùng serve để test
RUN npm install -g serve
EXPOSE 5000
CMD ["serve", "-s", "dist", "-l", "5000"]
