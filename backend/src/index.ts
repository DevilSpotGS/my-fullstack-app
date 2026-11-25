// จุดเริ่มต้นของ backend: เช็กฐานข้อมูล แล้วเปิดพอร์ตรอรับคำขอ

import { app } from "./app.js";
import { env } from "./config/env.js";
import { checkDatabaseConnection } from "./db/pool.js";

async function start(): Promise<void> {
  try {
    await checkDatabaseConnection();
    console.log(`✅ เชื่อมต่อ MySQL สำเร็จ (${env.db.host}:${env.db.port}/${env.db.database})`);
  } catch (error) {
    console.error("❌ เชื่อมต่อ MySQL ไม่ได้ ตรวจว่ารันฐานข้อมูลแล้ว (npm run db:up) และค่าใน .env ถูกต้อง");
    console.error(error);
    process.exit(1);
  }

  app.listen(env.port, () => {
    console.log(`🚀 API พร้อมใช้งานที่ http://localhost:${env.port}/api`);
  });
}

start();
