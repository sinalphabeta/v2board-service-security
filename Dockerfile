FROM oven/bun:1 as builder
WORKDIR /app
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build:bun

FROM oven/bun:1-slim
WORKDIR /app
COPY --from=builder /app/package.json ./
COPY --from=builder /app/bun.lock* ./
COPY --from=builder /app/dist ./dist
# COPY --from=builder /app/node_modules ./node_modules

ENV PORT=3000

EXPOSE ${PORT}

# 外部设置环境变量
ARG ADMINISTRATOR_TOKEN
ENV ADMINISTRATOR_TOKEN=${ADMINISTRATOR_TOKEN}

CMD ["bun", "run", "start"]
