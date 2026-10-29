# ==============================================================================
# Production Dockerfile for @epaper-studio/renderer
# Standalone Headless Chromium Vector PDF & E-Paper Rendering Microservice
# ==============================================================================

FROM node:22-bookworm-slim AS base

# Prevent interactive prompts during apt install
ENV DEBIAN_FRONTEND=noninteractive
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
ENV CHROMIUM_PATH=/usr/bin/chromium
ENV PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium
ENV NODE_ENV=production
ENV PORT=4000

# Install Chromium, fonts (Noto Devanagari & Latin fallbacks), fontconfig, and dumb-init
RUN apt-get update && apt-get install -y --no-install-recommends \
    chromium \
    fonts-noto-core \
    fonts-noto-ui-core \
    fonts-deva \
    fonts-deva-extra \
    fonts-freefont-ttf \
    fontconfig \
    dumb-init \
    ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Install pnpm globally matching monorepo version
RUN corepack enable && corepack prepare pnpm@12.15.0 --activate

WORKDIR /app

# Copy root workspace manifests
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json tsconfig.base.json ./

# Copy package manifests for dependency resolution
COPY packages/document-schema/package.json ./packages/document-schema/
COPY packages/typography/package.json ./packages/typography/
COPY packages/template-engine/package.json ./packages/template-engine/
COPY apps/renderer/package.json ./apps/renderer/

# Install all workspace dependencies (including devDependencies required for compilation)
RUN pnpm install --frozen-lockfile

# Copy source code and typography font assets
COPY packages/document-schema ./packages/document-schema
COPY packages/typography ./packages/typography
COPY packages/template-engine ./packages/template-engine
COPY apps/renderer ./apps/renderer

# Install self-hosted fonts into system fontconfig and rebuild cache
RUN mkdir -p /usr/share/fonts/truetype/epaper \
  && cp -r /app/packages/typography/fonts/* /usr/share/fonts/truetype/epaper/ \
  && fc-cache -fv

# Compile packages in dependency order
RUN pnpm --filter @epaper-studio/document-schema build \
  && pnpm --filter @epaper-studio/typography build \
  && pnpm --filter @epaper-studio/template-engine build \
  && pnpm --filter @epaper-studio/renderer build

# Prune devDependencies to keep image lean
RUN pnpm prune --prod

# Expose HTTP port (configurable at runtime via PORT environment variable)
EXPOSE 4000

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://localhost:' + (process.env.PORT || 4000) + '/api/health').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

# Use dumb-init to reap zombie chromium processes cleanly
ENTRYPOINT ["/usr/bin/dumb-init", "--"]

# Launch standalone HTTP rendering server
CMD ["node", "./apps/renderer/dist/server.js"]

