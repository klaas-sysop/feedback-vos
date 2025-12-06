# Dockerfile for Feedback Vos Example Site
# 
# Build from the project root directory:
#   docker build -f Dockerfile -t feedback-vos-example .
#
# Run the container:
#   docker run -p 80:80 --env-file example/.env.local feedback-vos-example
#
# Note: Make sure to set environment variables (NEXT_PUBLIC_GITHUB_TOKEN, etc.)
#       either via --env-file or -e flags

# Stage 1: Build parent package
FROM node:20-alpine AS parent-builder
WORKDIR /app

# Copy parent package files
COPY package.json package-lock.json ./
COPY tsconfig.json ./
COPY src ./src
COPY tsup.config.ts ./
COPY tailwind.config.js ./

# Install dependencies and build parent package
RUN npm ci && npm run build

# Stage 2: Build Next.js app
FROM node:20-alpine AS next-builder
WORKDIR /app

# Copy parent package build output to a local package directory
COPY --from=parent-builder /app/dist ./feedback-vos/dist
COPY --from=parent-builder /app/package.json ./feedback-vos/package.json

# Copy parent package.json and package-lock.json to install dependencies for src directory
COPY --from=parent-builder /app/package.json ./package.json
COPY --from=parent-builder /app/package-lock.json ./package-lock.json

# Install parent package dependencies so webpack can resolve them for src directory
RUN npm ci --omit=dev

# Copy example app files first
COPY example/package.json example/package-lock.json ./example/
COPY example/tsconfig.json ./example/
COPY example/tailwind.config.js ./example/
COPY example/postcss.config.js ./example/
COPY example/app ./example/app

# Copy src directory to match the expected import path
# The import ../../../src/components/Widget from example/app/components/FeedbackWidget.tsx
# means: from /app/example/app/components/ go up 3 levels to /app/, then src/components/Widget
# So we need /app/src/ to exist
COPY --from=parent-builder /app/src ./src

# Create a modified next.config.js that helps with module resolution
# Force webpack instead of Turbopack for better external directory support
RUN cat > ./example/next.config.js << 'EOF'
/** @type {import('next').NextConfig} */
const path = require('path');
const nextConfig = {
  output: 'standalone',
  experimental: {
    externalDir: true,
  },
  // Add resolve configuration for webpack to find src directory and its dependencies
  webpack: (config, { isServer }) => {
    config.resolve.modules = [
      ...(config.resolve.modules || []),
      path.resolve(__dirname, '..'),
      path.resolve(__dirname, '../node_modules'),
    ];
    return config;
  },
  // Add empty turbopack config to silence the warning, but we'll use webpack
  turbopack: {},
}
module.exports = nextConfig
EOF

# Change to example directory for build
WORKDIR /app/example

# Install the local feedback-vos package and example dependencies
# Note: feedback-vos is in /app/feedback-vos, so we need to go up one level
RUN npm install ../feedback-vos && npm ci

# Build Next.js app using webpack instead of Turbopack
RUN npm run build -- --webpack

# Stage 3: Production runtime
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy necessary files from builder (built in /app/example)
COPY --from=next-builder /app/example/.next/standalone ./
COPY --from=next-builder /app/example/.next/static ./.next/static

# Copy public directory if it exists (optional - uncomment if you have a public directory)
# COPY --from=next-builder /app/public ./public

# Set correct permissions
RUN chown -R nextjs:nodejs /app

# Allow non-root user to bind to port 80
RUN apk add --no-cache libcap && \
    setcap cap_net_bind_service=+ep /usr/local/bin/node

USER nextjs

EXPOSE 80

ENV PORT=80
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]

