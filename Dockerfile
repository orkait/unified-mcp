FROM oven/bun:alpine
LABEL org.opencontainers.image.source="https://github.com/orkait/hyperstack"
LABEL org.opencontainers.image.description="Hyperstack MCP server"
LABEL org.opencontainers.image.licenses="MIT"
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY src/ src/
USER bun
ENTRYPOINT ["bun", "src/index.ts"]
