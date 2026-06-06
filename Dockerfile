# --- Stage 1: Build Stage (Handles TSX -> Minified JS) ---
FROM oven/bun:latest as builder

WORKDIR /app

# 1. Install dependencies first (for faster caching)
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# 2. Set build arguments (Inlined during compilation)
ARG VITE_API_URL
ARG VITE_API_APP_ID
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_API_APP_ID=$VITE_API_APP_ID
ENV NODE_ENV=production

# 3. Copy source and build
COPY . .
RUN bun run build


# --- Stage 2: Final Production Stage (IP Protected) ---
FROM oven/bun:latest

WORKDIR /app

# Install curl for healthchecks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# 4. ONLY copy the compiled bundle. 
# Your source code (src/*.tsx) stays in Stage 1 and is GONE from this image.
COPY --from=builder /app/.output /app/.output

# Set runtime environment
ENV NODE_ENV=production
ENV PORT=2000

EXPOSE 2000

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD curl -f http://localhost:2000/ || exit 1

# Start the optimized Nitro server
ENTRYPOINT []
CMD ["bun", "run", ".output/server/index.mjs"]
