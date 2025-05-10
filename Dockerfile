FROM oven/bun:1 as builder
WORKDIR /app
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build

FROM oven/bun:1-slim
WORKDIR /app
COPY --from=builder /app/package.json ./
COPY --from=builder /app/bun.lock* ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

ENV PASSWORD=""
ENV DOMAIN=""
ENV PORT=3000

EXPOSE ${PORT}
 
CMD ["bun", "run", "start"]
