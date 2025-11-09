# -----------------------
# 1. Build Stage
# -----------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source code
COPY . .

# Build Vite app
RUN npm run build

# -----------------------
# 2. Production Stage
# -----------------------
FROM node:20-alpine

WORKDIR /app

# Copy built files
COPY --from=builder /app/dist ./dist

# Install a lightweight static server
RUN npm install -g serve

# Expose Cloud Run default port
ENV PORT=8080
EXPOSE 8080

# Start the server
CMD ["serve", "-s", "dist", "-l", "8080"]