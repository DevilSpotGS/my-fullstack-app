# Dockerfile ของ backend แบบ 2 ขั้น (multi-stage)
# ขั้นที่ 1 build TypeScript → JavaScript, ขั้นที่ 2 เก็บเฉพาะสิ่งที่ต้องใช้รัน (image เล็กลง)

# ---------- ขั้นที่ 1: build ----------
FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ---------- ขั้นที่ 2: run ----------
FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json* ./
RUN npm install --omit=dev
COPY --from=build /app/dist ./dist
USER node
EXPOSE 4000
CMD ["node", "dist/index.js"]
