// ตั้งค่า Vitest สำหรับ frontend (Unit Test ของ component และฟังก์ชันเรียก API)
// รัน: npm test (รันครั้งเดียว) หรือ npm run test:watch (รันใหม่ทุกครั้งที่แก้ไฟล์)

import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    // ให้ import "@/..." ใช้ได้เหมือนในแอป (ตรงกับ paths ใน tsconfig.json)
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    include: ["tests/**/*.test.{ts,tsx}"], // ไฟล์ test อยู่ในโฟลเดอร์ tests/
    environment: "jsdom", // จำลองเบราว์เซอร์ (มี document, window) ให้ React render ได้
    setupFiles: ["./tests/setup.ts"],
    env: { NEXT_PUBLIC_API_URL: "http://api.test" }, // URL ปลอม: test ไม่ได้เรียก backend จริง
    clearMocks: true,
    restoreMocks: true,
    unstubGlobals: true, // คืนค่า fetch ตัวจริงหลังจบแต่ละ test
  },
});
