FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files first (for better layer caching)
COPY package.json package-lock.json ./

# Install dependencies with a clean slate
RUN npm ci

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# Production image
FROM node:22-alpine

WORKDIR /app

# Copy only necessary files from builder
COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/dist ./dist

# Install only production dependencies
RUN npm ci --only=production

# Set environment variables
ENV NODE_ENV=production

# Document that the container listens on port 3000 by default
EXPOSE 3000

# Start the application
CMD ["node", "dist/main.js"]
