FROM oven/bun:1.3.3

WORKDIR /app

COPY . .

RUN bun install


WORKDIR /app/apps/api

EXPOSE 3001

CMD ["bun", "run", "src/index.ts"]