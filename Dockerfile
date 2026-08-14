# syntax=docker/dockerfile:1

FROM node:22-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG VITE_HOST_API=https://misdaq-production-83bc.up.railway.app
ENV VITE_HOST_API=$VITE_HOST_API

RUN npm run build:ssr \
  && npx esbuild server/index.ts \
    --platform=node \
    --format=esm \
    --outfile=dist/ssr-server.mjs \
    --packages=external

FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=1573

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /app/dist ./dist

USER node
EXPOSE 1573

CMD ["node", "dist/ssr-server.mjs"]
