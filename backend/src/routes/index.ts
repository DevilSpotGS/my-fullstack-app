// รวมทุก router ของ API ไว้ที่เดียว
// เพิ่มฟีเจอร์ใหม่: สร้าง xxx.routes.ts แล้วมาต่อที่นี่ 1 บรรทัด

import { Router } from "express";
import { checkDatabaseConnection } from "../db/pool.js";
import { taskRouter } from "./task.routes.js";

export const apiRouter = Router();

// GET /api/health → เช็กว่า API และฐานข้อมูลทำงานอยู่
apiRouter.get("/health", async (_req, res) => {
  await checkDatabaseConnection();
  res.json({ status: "ok", database: "connected" });
});

apiRouter.use("/tasks", taskRouter);
