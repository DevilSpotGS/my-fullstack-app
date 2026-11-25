# Dockerfile ของ frontend (Next.js) แบบ 2 ขั้น

# ---------- ขั้นที่ 1: build ----------
FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
# ค่า NEXT_PUBLIC_* ต้องมีตอน build เพราะถูกฝังลงในโค้ดที่ส่งให้เบราว์เซอร์
ARG NEXT_PUBLIC_API_URL=http://localhost:4000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN npm run build

# ---------- ขั้นที่ 2: run (ใช้ผลจาก output: "standalone") ----------
FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
USER node
EXPOSE 3000
CMD ["node", "server.js"]
