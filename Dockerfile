FROM node:24-bookworm-slim

WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# Install exactly what package-lock.json lists (cached until the dependencies change).
COPY package.json package-lock.json ./
RUN npm ci
# .dockerignore keeps data/, .env files and .git out of the image.
COPY . .
RUN npm run build && mkdir -p data && chown -R node:node data .next

ENV NODE_ENV=production
# The app does not need root. A named volume mounted on /app/data starts out owned by this user.
USER node
VOLUME /app/data
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/api/health').then((r) => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"
CMD ["npm", "start"]
