FROM oven/bun:latest AS builder

WORKDIR /builder

COPY package.json bun.lock ./
COPY packages/agent/package.json ./packages/agent/
COPY packages/api-client/package.json ./packages/api-client/

COPY apps/app/package.json ./apps/app/
COPY apps/api/package.json ./apps/api/

RUN bun install --frozen-lockfile

COPY . .

ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ARG VITE_API_WEBSOCKET_URL
ENV VITE_API_WEBSOCKET_URL=$VITE_API_WEBSOCKET_URL

RUN bun --filter=api run build
RUN bun --filter=app run build

# RUN ls -la /
# RUN pwd
# RUN akdjn


FROM oven/bun:slim AS server

WORKDIR /app

COPY --from=builder /builder/apps/api/server-binary ./server-binary
COPY --from=builder /builder/apps/api/drizzle ./drizzle

RUN chmod +x ./server-binary

CMD ["./server-binary"]


FROM oven/bun:slim AS app

WORKDIR /app

COPY --from=builder /builder/apps/app/dist ./dist
COPY --from=builder /builder/apps/app/serve.ts ./dist/serve.ts

WORKDIR /app/dist

CMD ["bun", "serve.ts"]
