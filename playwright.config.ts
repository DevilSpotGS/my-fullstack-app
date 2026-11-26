// ตั้งค่า Playwright (E2E test = ทดสอบผ่านเบราว์เซอร์จริง เหมือนผู้ใช้คลิกเอง)
// ก่อนรันต้องเปิดแอปไว้ก่อน: npm run docker:up (หรือ npm run dev)
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false, // เทสใช้ฐานข้อมูลเดียวกัน รันทีละไฟล์จะไม่ชนกัน
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry", // เก็บ trace ไว้ดูย้อนหลังเมื่อเทสพัง
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } }, // เช็คหน้าจอมือถือด้วย
  ],
});
