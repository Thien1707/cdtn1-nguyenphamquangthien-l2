FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

COPY src ./src
COPY tests ./tests
COPY scripts/docker-entrypoint.sh ./scripts/docker-entrypoint.sh
RUN sed -i 's/\r$//' ./scripts/docker-entrypoint.sh

EXPOSE 3000

HEALTHCHECK --interval=10s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["sh", "./scripts/docker-entrypoint.sh"]
