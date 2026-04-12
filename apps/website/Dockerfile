# Stage 1: Build
FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

WORKDIR /app

# Copy workspace root files
COPY pnpm-workspace.yaml package.json ./

# Copy SDK package (dependency)
COPY packages/sdk/package.json packages/sdk/
COPY packages/sdk/src packages/sdk/src
COPY packages/sdk/tsconfig.json packages/sdk/

# Copy dashboard package (needed for Vue island imports via @dashboard alias)
COPY apps/dashboard/package.json apps/dashboard/
COPY apps/dashboard/src apps/dashboard/src
COPY apps/dashboard/tailwind.config.ts apps/dashboard/
COPY apps/dashboard/tsconfig.json apps/dashboard/

# Copy website package
COPY apps/website/package.json apps/website/
COPY apps/website/src apps/website/src
COPY apps/website/public apps/website/public
COPY apps/website/astro.config.mjs apps/website/
COPY apps/website/tsconfig.json apps/website/
COPY apps/website/tailwind.config.ts apps/website/
COPY apps/website/postcss.config.js apps/website/

# Install dependencies
RUN pnpm install --no-frozen-lockfile --ignore-scripts

# Build SDK first (may be needed by dashboard imports), then website
RUN pnpm --filter @njord/sdk build 2>/dev/null || true
RUN pnpm --filter @njord/website build

# Stage 2: Serve
FROM nginx:alpine

# Copy nginx config
COPY apps/website/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets
COPY --from=builder /app/apps/website/dist /usr/share/nginx/html

# Copy entrypoint script
COPY apps/website/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
