// CONTROLLER = ชั้นที่รับคำขอ (req) และส่งคำตอบ (res)
// หน้าที่: อ่านและตรวจข้อมูลที่ส่งมา → เรียก service → ตอบกลับเป็น JSON

import type { Request, Response } from "express";
import { HttpError } from "../middlewares/http-error.js";
import * as taskService from "../services/task.service.js";

// แปลง :id ใน URL เป็นตัวเลข และตรวจว่าถูกต้อง
function parseId(raw: string | string[] | undefined): number {
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) {
    throw new HttpError(400, "id ต้องเป็นตัวเลขจำนวนเต็มบวก");
  }
  return id;
}

// ตรวจชื่องาน: ต้องเป็นข้อความ ไม่ว่าง ไม่เกิน 255 ตัวอักษร
function parseTitle(value: unknown): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new HttpError(400, "กรุณาใส่ชื่องาน (title)");
  }
  if (value.length > 255) {
    throw new HttpError(400, "ชื่องานยาวเกิน 255 ตัวอักษร");
  }
  return value.trim();
}

// GET /api/tasks
export async function listTasks(_req: Request, res: Response): Promise<void> {
  const tasks = await taskService.findAllTasks();
  res.json(tasks);
}

// GET /api/tasks/:id
export async function getTask(req: Request, res: Response): Promise<void> {
  const task = await taskService.findTaskById(parseId(req.params.id));
  if (!task) throw new HttpError(404, "ไม่พบงานนี้");
  res.json(task);
}

// POST /api/tasks   body: { "title": "..." }
export async function createTask(req: Request, res: Response): Promise<void> {
  const title = parseTitle(req.body?.title);
  const task = await taskService.createTask({ title });
  res.status(201).json(task); // 201 = สร้างสำเร็จ
}

// PATCH /api/tasks/:id   body: { "title"?: "...", "done"?: true }
export async function updateTask(req: Request, res: Response): Promise<void> {
  const id = parseId(req.params.id);
  const body = req.body ?? {};

  if (body.done !== undefined && typeof body.done !== "boolean") {
    throw new HttpError(400, "done ต้องเป็น true หรือ false");
  }
  const title = body.title !== undefined ? parseTitle(body.title) : undefined;

  const task = await taskService.updateTask(id, { title, done: body.done });
  if (!task) throw new HttpError(404, "ไม่พบงานนี้");
  res.json(task);
}

// DELETE /api/tasks/:id
export async function deleteTask(req: Request, res: Response): Promise<void> {
  const deleted = await taskService.deleteTask(parseId(req.params.id));
  if (!deleted) throw new HttpError(404, "ไม่พบงานนี้");
  res.status(204).end(); // 204 = สำเร็จ ไม่มีข้อมูลตอบกลับ
}
