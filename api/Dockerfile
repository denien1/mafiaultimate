# ---------- build ----------
FROM node:20-alpine AS build
WORKDIR /app
COPY api/package*.json ./
RUN npm ci || npm i
COPY api/ .
RUN npm run build

# ---------- runtime ----------
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/dist ./dist
COPY --from=build /app/package*.json ./
RUN npm ci --omit=dev || npm i --omit=dev
ENV PORT=4000
EXPOSE 4000
CMD ["node","dist/main.js"]
