FROM node:24-bookworm-slim

WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# Install exactly what package-lock.json lists (cached until the dependencies change).
COPY package.json package-lock.json ./
RUN npm ci
# .dockerignore keeps data/, .env files and .git out of the image.
COPY . .
RUN npm run build

ENV NODE_ENV=production
EXPOSE 3000
CMD ["npm", "start"]
