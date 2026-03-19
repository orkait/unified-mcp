FROM node:24-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY dist/ dist/
COPY snippets/ snippets/
USER node
ENTRYPOINT ["node", "dist/index.js"]
