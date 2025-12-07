# Use Node.js LTS version
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files for root and install dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Copy package files for example and install dependencies
COPY example/package.json example/package-lock.json* ./example/
WORKDIR /app/example
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/example/node_modules ./example/node_modules

# Copy source files
COPY . .

# Accept build arguments for environment variables (for Dokploy)
ARG NEXT_PUBLIC_GITHUB_TOKEN
ARG NEXT_PUBLIC_GITHUB_OWNER
ARG NEXT_PUBLIC_GITHUB_REPO
ARG NEXT_PUBLIC_FEEDBACK_POSITION
ARG NEXT_PUBLIC_FEEDBACK_LANG
ARG NEXT_PUBLIC_FEEDBACK_THEME
ARG NEXT_PUBLIC_FEEDBACK_ENABLED

# Set environment variables from build arguments (required for Next.js build)
ENV NEXT_PUBLIC_GITHUB_TOKEN=$NEXT_PUBLIC_GITHUB_TOKEN
ENV NEXT_PUBLIC_GITHUB_OWNER=$NEXT_PUBLIC_GITHUB_OWNER
ENV NEXT_PUBLIC_GITHUB_REPO=$NEXT_PUBLIC_GITHUB_REPO
ENV NEXT_PUBLIC_FEEDBACK_POSITION=$NEXT_PUBLIC_FEEDBACK_POSITION
ENV NEXT_PUBLIC_FEEDBACK_LANG=$NEXT_PUBLIC_FEEDBACK_LANG
ENV NEXT_PUBLIC_FEEDBACK_THEME=$NEXT_PUBLIC_FEEDBACK_THEME
ENV NEXT_PUBLIC_FEEDBACK_ENABLED=$NEXT_PUBLIC_FEEDBACK_ENABLED

# Build the root package
WORKDIR /app
RUN npm run build

# Build the example app
WORKDIR /app/example
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Set the correct permission for prerender cache
RUN mkdir -p .next
RUN chown nextjs:nodejs .next

# Copy the standalone output (includes public assets automatically in .next/static)
COPY --from=builder --chown=nextjs:nodejs /app/example/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/example/.next/static ./example/.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
CMD ["node", "example/server.js"]
