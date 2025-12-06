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

# Recreate the directory structure to match local development
# Local: example/app/components/FeedbackWidget.tsx imports ../../../src/components/Widget
# This means: from example/app/components/ go up 3 levels to root, then src/components/Widget
# So we need: /app/src/ (parent src) and /app/example/app/ (example app)
COPY --from=parent-builder /app/src ./src

# Copy example app files into example directory to match local structure
COPY example/package.json example/package-lock.json ./example/
COPY example/tsconfig.json ./example/
COPY example/next.config.js ./example/
COPY example/tailwind.config.js ./example/
COPY example/postcss.config.js ./example/
COPY example/app ./example/app

# Change to example directory for build
WORKDIR /app/example

# Install the local feedback-vos package and example dependencies
# Note: feedback-vos is in /app/feedback-vos, so we need to go up one level
RUN npm install ../feedback-vos && npm ci

# Build Next.js app
RUN npm run build

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

