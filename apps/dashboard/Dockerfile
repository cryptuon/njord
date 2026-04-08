# Stage 1: Build
FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

WORKDIR /app

# Copy workspace root files
COPY pnpm-workspace.yaml package.json ./
COPY pnpm-lock.yaml* ./

# Copy SDK package (dependency)
COPY packages/sdk/package.json packages/sdk/
COPY packages/sdk/src packages/sdk/src
COPY packages/sdk/tsconfig.json packages/sdk/

# Copy dashboard package
COPY apps/dashboard/package.json apps/dashboard/
COPY apps/dashboard/src apps/dashboard/src
COPY apps/dashboard/public apps/dashboard/public
COPY apps/dashboard/index.html apps/dashboard/
COPY apps/dashboard/vite.config.ts apps/dashboard/
COPY apps/dashboard/tsconfig.json apps/dashboard/
COPY apps/dashboard/tailwind.config.ts apps/dashboard/
COPY apps/dashboard/postcss.config.js apps/dashboard/
COPY apps/dashboard/env.d.ts apps/dashboard/

# Install dependencies
RUN pnpm install --no-frozen-lockfile --ignore-scripts

# Build SDK first, then dashboard
RUN pnpm --filter @njord/sdk build 2>/dev/null || true
RUN pnpm --filter @njord/dashboard build

# Stage 2: Serve
FROM nginx:alpine

# Copy nginx config
COPY apps/dashboard/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets
COPY --from=builder /app/apps/dashboard/dist /usr/share/nginx/html

# Copy entrypoint script
COPY apps/dashboard/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
