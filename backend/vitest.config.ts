// ตั้งค่า Vitest (เครื่องมือรัน Unit Test)
// รัน: npm test (รันครั้งเดียว) หรือ npm run test:watch (รันใหม่ทุกครั้งที่แก้ไฟล์)

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"], // ไฟล์ test อยู่ในโฟลเดอร์ tests/
    environment: "node",
    // ค่าปลอมสำหรับตอนทดสอบ: test ไม่ได้ต่อฐานข้อมูลจริง แต่ config/env.ts ต้องมีค่าพวกนี้
    env: {
      DB_USER: "test_user",
      DB_PASSWORD: "test_password",
      DB_NAME: "test_db",
    },
    clearMocks: true, // ล้างประวัติการเรียก mock ก่อนเริ่มแต่ละ test
  },
});
