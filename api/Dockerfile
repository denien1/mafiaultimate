FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* .npmrc* ./
RUN npm i || true
RUN npx -y @nestjs/cli new tmp --skip-git --package-manager npm >/dev/null 2>&1 || true
COPY . .
RUN npm run build
ENV PORT=4000
EXPOSE 4000
CMD ["npm","run","start"]
