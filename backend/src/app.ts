// สร้างและตั้งค่าแอป Express (ยังไม่เปิดพอร์ต)
// ลำดับของ app.use() สำคัญ: คำขอจะผ่านจากบนลงล่าง

import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import { errorHandler, notFound } from "./middlewares/error-handler.js";
import { apiRouter } from "./routes/index.js";

export const app = express();

app.use(cors({ origin: env.corsOrigin })); // 1) อนุญาตให้หน้าเว็บ (คนละพอร์ต) เรียก API ได้
app.use(express.json()); //                   2) อ่าน body ที่เป็น JSON ให้อยู่ใน req.body

app.use("/api", apiRouter); //                3) เส้นทางทั้งหมดของ API ขึ้นต้นด้วย /api

app.use(notFound); //                         4) ไม่ตรงกับ route ไหนเลย → 404
app.use(errorHandler); //                     5) จัดการ error ทั้งหมด (ต้องอยู่ท้ายสุด)
