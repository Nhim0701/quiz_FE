# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci --legacy-peer-deps

COPY . .

# Inject build-time env vars (Vite embeds VITE_* into the static bundle)
ARG VITE_API_BASE_URL=/
ARG VITE_QUESTION_ASSET_PREFIX=questions/uploads
ARG VITE_QUESTION_ASSET_EXPIRES_IN=3600
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_QUESTION_ASSET_PREFIX=$VITE_QUESTION_ASSET_PREFIX
ENV VITE_QUESTION_ASSET_EXPIRES_IN=$VITE_QUESTION_ASSET_EXPIRES_IN

RUN npm run build

# Stage 2: Production runtime (SSR via react-router-serve)
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy both client and server bundles required for SSR
COPY --from=builder /app/build ./build
COPY --from=builder /app/package*.json ./

# Install only production dependencies needed to run react-router-serve
RUN npm ci --legacy-peer-deps --omit=dev

EXPOSE 3000
CMD ["npx", "react-router-serve", "./build/server/index.js"]
