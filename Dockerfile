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

# Install parent package dependencies including devDependencies for TypeScript types
# We need @types/react and other type definitions
RUN npm ci

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
  // Configure TypeScript to use types from example app's node_modules
  typescript: {
    tsconfigPath: './tsconfig.json',
  },
}
module.exports = nextConfig
EOF

# Also update tsconfig.json to include parent node_modules for type resolution and .d.ts files
RUN node -e "const fs = require('fs'); const tsconfig = JSON.parse(fs.readFileSync('./example/tsconfig.json', 'utf8')); tsconfig.compilerOptions = tsconfig.compilerOptions || {}; tsconfig.compilerOptions.typeRoots = ['../node_modules/@types', './node_modules/@types']; if (!tsconfig.include.includes('../src/**/*.d.ts')) { tsconfig.include.push('../src/**/*.d.ts'); } if (!tsconfig.include.includes('**/*.d.ts')) { tsconfig.include.push('**/*.d.ts'); } fs.writeFileSync('./example/tsconfig.json', JSON.stringify(tsconfig, null, 2));"

# Create a type declaration file for SVG imports with ?raw query parameter
# Place it in the example directory so TypeScript can find it
RUN cat > ./example/svg-raw.d.ts << 'EOF'
declare module '*.svg?raw' {
  const content: string;
  export default content;
}
EOF

# Also create it in the src directory for the src files
RUN cat > ./src/svg-raw.d.ts << 'EOF'
declare module '*.svg?raw' {
  const content: string;
  export default content;
}
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

# Create a Node.js script that patches server.js to use PORT=80
# This is more reliable than sed because we can properly parse and modify the file
RUN cat > /app/patch-server.js << 'EOF' && chown nextjs:nodejs /app/patch-server.js
const fs = require('fs');
const path = require('path');

const serverPath = path.join(__dirname, 'server.js');

if (!fs.existsSync(serverPath)) {
  console.error('server.js not found!');
  process.exit(1);
}

let serverCode = fs.readFileSync(serverPath, 'utf8');

// Replace various patterns for port 3000
const replacements = [
  // process.env.PORT || 3000 -> process.env.PORT || 80
  [/(process\.env\.PORT\s*\|\|\s*)3000/g, '$180'],
  // :3000 -> :80 (but be careful not to replace in other contexts)
  [/:3000(?!\d)/g, ':80'],
  // const port = 3000 -> const port = process.env.PORT || 80
  [/const\s+port\s*=\s*3000/g, 'const port = process.env.PORT || 80'],
  // let port = 3000 -> let port = process.env.PORT || 80
  [/let\s+port\s*=\s*3000/g, 'let port = process.env.PORT || 80'],
  // var port = 3000 -> var port = process.env.PORT || 80
  [/var\s+port\s*=\s*3000/g, 'var port = process.env.PORT || 80'],
  // port = 3000 -> port = process.env.PORT || 80
  [/(\s+)port\s*=\s*3000(\s|;|,)/g, '$1port = process.env.PORT || 80$2'],
];

let modified = false;
for (const [pattern, replacement] of replacements) {
  if (serverCode.match(pattern)) {
    serverCode = serverCode.replace(pattern, replacement);
    modified = true;
  }
}

if (modified) {
  fs.writeFileSync(serverPath, serverCode, 'utf8');
  console.log('server.js patched successfully');
} else {
  console.log('No port 3000 found in server.js, assuming it uses PORT env var');
}
EOF

# Patch server.js using Node.js (more reliable than sed)
RUN node /app/patch-server.js || echo "Warning: Could not patch server.js"

# Backup original server.js and create a wrapper that forces PORT=80
RUN if [ -f server.js ]; then \
      mv server.js server.js.original; \
      cat > server.js << 'SERVEREOF'
// Wrapper for Next.js standalone server.js
// This ensures PORT=80 is used

// Force PORT and HOSTNAME before loading original server
process.env.PORT = '80';
process.env.HOSTNAME = '0.0.0.0';

console.log('=== Starting Next.js Standalone Server ===');
console.log('PORT:', process.env.PORT);
console.log('HOSTNAME:', process.env.HOSTNAME);

// Load and execute the original server code
// This ensures PORT env var is set before the server initializes
require('./server.js.original');
SERVEREOF
      chown nextjs:nodejs server.js; \
    fi

USER nextjs

EXPOSE 80

# Set PORT and HOSTNAME environment variables
ENV PORT=80
ENV HOSTNAME="0.0.0.0"

# Use server.js (which is now a wrapper that ensures PORT=80)
CMD ["node", "server.js"]

