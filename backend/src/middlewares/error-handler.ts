// MIDDLEWARE = ฟังก์ชันที่ทำงาน "ระหว่างทาง" ของทุกคำขอ
// ไฟล์นี้มี 2 ตัว: ตอบ 404 เมื่อไม่มี route และรวมการจัดการ error ไว้ที่เดียว

import type { NextFunction, Request, Response } from "express";
import { HttpError } from "./http-error.js";

// ไม่มี route ไหนตรงกับ URL ที่ขอมา
export function notFound(req: Request, res: Response): void {
  res.status(404).json({ error: `ไม่พบเส้นทาง ${req.method} ${req.originalUrl}` });
}

// Express 5 ส่ง error จาก async function มาที่นี่ให้อัตโนมัติ (ไม่ต้องเขียน try/catch ทุกที่)
// ต้องมีพารามิเตอร์ครบ 4 ตัว Express จึงรู้ว่าเป็นตัวจัดการ error
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message });
    return;
  }
  console.error(err); // error ที่ไม่ได้คาดไว้: พิมพ์ลง log เพื่อแก้บั๊ก
  res.status(500).json({ error: "เกิดข้อผิดพลาดในเซิร์ฟเวอร์" });
}
