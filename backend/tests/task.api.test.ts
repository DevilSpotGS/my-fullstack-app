// Unit Test ของ API (routes + controllers + middlewares)
// ใช้ supertest ยิงคำขอ HTTP เข้า app โดยไม่ต้องเปิดพอร์ตจริง
// mock ชั้น service ไว้ จึงทดสอบเฉพาะ "การรับคำขอ ตรวจข้อมูล และตอบกลับ" ไม่ต้องมีฐานข้อมูล

import request from "supertest";
import { describe, expect, it, vi } from "vitest";

vi.mock("../src/services/task.service.js", () => ({
  findAllTasks: vi.fn(),
  findTaskById: vi.fn(),
  createTask: vi.fn(),
  updateTask: vi.fn(),
  deleteTask: vi.fn(),
}));

vi.mock("../src/db/pool.js", () => ({
  pool: {},
  checkDatabaseConnection: vi.fn(),
}));

import { app } from "../src/app.js";
import { checkDatabaseConnection } from "../src/db/pool.js";
import * as taskService from "../src/services/task.service.js";
import type { Task } from "../src/types/task.js";

const sample: Task = {
  id: 1,
  title: "ทดสอบ",
  done: false,
  createdAt: "2026-11-25T02:00:00.000Z",
};

describe("GET /api/health", () => {
  it("ตอบ ok เมื่อต่อฐานข้อมูลได้", async () => {
    vi.mocked(checkDatabaseConnection).mockResolvedValueOnce();

    const res = await request(app).get("/api/health");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok", database: "connected" });
  });

  it("ตอบ 500 เมื่อต่อฐานข้อมูลไม่ได้", async () => {
    vi.mocked(checkDatabaseConnection).mockRejectedValueOnce(new Error("down"));
    vi.spyOn(console, "error").mockImplementation(() => {}); // ไม่ให้ log รก

    const res = await request(app).get("/api/health");

    expect(res.status).toBe(500);
  });
});

describe("GET /api/tasks", () => {
  it("ตอบรายการงานเป็น JSON", async () => {
    vi.mocked(taskService.findAllTasks).mockResolvedValueOnce([sample]);

    const res = await request(app).get("/api/tasks");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([sample]);
  });
});

describe("GET /api/tasks/:id", () => {
  it("ตอบงานที่ขอ", async () => {
    vi.mocked(taskService.findTaskById).mockResolvedValueOnce(sample);

    const res = await request(app).get("/api/tasks/1");

    expect(res.status).toBe(200);
    expect(taskService.findTaskById).toHaveBeenCalledWith(1);
  });

  it("ตอบ 404 เมื่อไม่พบงาน", async () => {
    vi.mocked(taskService.findTaskById).mockResolvedValueOnce(null);

    const res = await request(app).get("/api/tasks/99");

    expect(res.status).toBe(404);
    expect(res.body.error).toBe("ไม่พบงานนี้");
  });

  it("ตอบ 400 เมื่อ id ไม่ใช่ตัวเลข", async () => {
    const res = await request(app).get("/api/tasks/abc");

    expect(res.status).toBe(400);
    expect(taskService.findTaskById).not.toHaveBeenCalled();
  });
});

describe("POST /api/tasks", () => {
  it("สร้างงานและตอบ 201 (ตัดช่องว่างหัวท้ายชื่อให้)", async () => {
    vi.mocked(taskService.createTask).mockResolvedValueOnce(sample);

    const res = await request(app).post("/api/tasks").send({ title: "  ทดสอบ  " });

    expect(res.status).toBe(201);
    expect(taskService.createTask).toHaveBeenCalledWith({ title: "ทดสอบ" });
  });

  it.each([
    ["ไม่ส่ง title", {}],
    ["title ว่าง", { title: "   " }],
    ["title ไม่ใช่ข้อความ", { title: 123 }],
    ["title ยาวเกิน 255", { title: "ก".repeat(256) }],
  ])("ตอบ 400 เมื่อ%s", async (_label, body) => {
    const res = await request(app).post("/api/tasks").send(body);

    expect(res.status).toBe(400);
    expect(taskService.createTask).not.toHaveBeenCalled();
  });
});

describe("PATCH /api/tasks/:id", () => {
  it("แก้สถานะ done ได้", async () => {
    vi.mocked(taskService.updateTask).mockResolvedValueOnce({ ...sample, done: true });

    const res = await request(app).patch("/api/tasks/1").send({ done: true });

    expect(res.status).toBe(200);
    expect(res.body.done).toBe(true);
    expect(taskService.updateTask).toHaveBeenCalledWith(1, { title: undefined, done: true });
  });

  it("ตอบ 400 เมื่อ done ไม่ใช่ true/false", async () => {
    const res = await request(app).patch("/api/tasks/1").send({ done: "yes" });

    expect(res.status).toBe(400);
  });

  it("ตอบ 404 เมื่อไม่พบงาน", async () => {
    vi.mocked(taskService.updateTask).mockResolvedValueOnce(null);

    const res = await request(app).patch("/api/tasks/99").send({ done: true });

    expect(res.status).toBe(404);
  });
});

describe("DELETE /api/tasks/:id", () => {
  it("ลบสำเร็จตอบ 204", async () => {
    vi.mocked(taskService.deleteTask).mockResolvedValueOnce(true);

    const res = await request(app).delete("/api/tasks/1");

    expect(res.status).toBe(204);
  });

  it("ตอบ 404 เมื่อไม่มีงานให้ลบ", async () => {
    vi.mocked(taskService.deleteTask).mockResolvedValueOnce(false);

    const res = await request(app).delete("/api/tasks/99");

    expect(res.status).toBe(404);
  });
});

describe("เส้นทางที่ไม่มีอยู่", () => {
  it("ตอบ 404 พร้อมข้อความ", async () => {
    const res = await request(app).get("/api/nope");

    expect(res.status).toBe(404);
    expect(res.body.error).toContain("/api/nope");
  });
});
