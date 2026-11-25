// Unit Test ของชั้น SERVICE (services/task.service.ts)
// ทดสอบว่า service ส่ง SQL ถูก และแปลงข้อมูลจาก MySQL เป็น Task ถูกต้อง
// ใช้ "mock" แทนฐานข้อมูลจริง: เรากำหนดเองว่า pool.query / pool.execute จะตอบอะไร

import { beforeEach, describe, expect, it, vi } from "vitest";

// แทนที่ไฟล์ db/pool.ts ทั้งไฟล์ด้วยของปลอม (ต้องประกาศก่อน import service)
vi.mock("../src/db/pool.js", () => ({
  pool: { query: vi.fn(), execute: vi.fn() },
  checkDatabaseConnection: vi.fn(),
}));

import { pool } from "../src/db/pool.js";
import * as taskService from "../src/services/task.service.js";

// ตัวช่วยให้ TypeScript รู้ว่าเป็น mock
const query = vi.mocked(pool.query);
const execute = vi.mocked(pool.execute);

// แถวตัวอย่างหน้าตาเหมือนที่ MySQL ส่งกลับมา
const row = (id: number, title: string, done: 0 | 1) => ({
  id,
  title,
  done,
  created_at: new Date("2026-11-25T02:00:00.000Z"),
});

describe("task.service", () => {
  beforeEach(() => {
    query.mockReset();
    execute.mockReset();
  });

  describe("findAllTasks", () => {
    it("แปลงแถวจาก MySQL เป็น Task (done 0/1 → true/false, created_at → createdAt)", async () => {
      query.mockResolvedValueOnce([[row(2, "งาน B", 1), row(1, "งาน A", 0)], []] as never);

      const tasks = await taskService.findAllTasks();

      expect(tasks).toEqual([
        { id: 2, title: "งาน B", done: true, createdAt: "2026-11-25T02:00:00.000Z" },
        { id: 1, title: "งาน A", done: false, createdAt: "2026-11-25T02:00:00.000Z" },
      ]);
      expect(query).toHaveBeenCalledWith(expect.stringContaining("ORDER BY id DESC"));
    });

    it("คืน array ว่างเมื่อยังไม่มีงาน", async () => {
      query.mockResolvedValueOnce([[], []] as never);
      expect(await taskService.findAllTasks()).toEqual([]);
    });
  });

  describe("findTaskById", () => {
    it("ส่ง id เป็นพารามิเตอร์ ? (กัน SQL injection)", async () => {
      query.mockResolvedValueOnce([[row(5, "งาน", 0)], []] as never);

      await taskService.findTaskById(5);

      expect(query).toHaveBeenCalledWith(expect.stringContaining("WHERE id = ?"), [5]);
    });

    it("คืน null เมื่อไม่พบงาน", async () => {
      query.mockResolvedValueOnce([[], []] as never);
      expect(await taskService.findTaskById(99)).toBeNull();
    });
  });

  describe("createTask", () => {
    it("INSERT แล้วอ่านงานที่สร้างกลับมา", async () => {
      execute.mockResolvedValueOnce([{ insertId: 7 }, []] as never);
      query.mockResolvedValueOnce([[row(7, "งานใหม่", 0)], []] as never);

      const task = await taskService.createTask({ title: "งานใหม่" });

      expect(execute).toHaveBeenCalledWith("INSERT INTO tasks (title) VALUES (?)", ["งานใหม่"]);
      expect(task).toMatchObject({ id: 7, title: "งานใหม่", done: false });
    });
  });

  describe("updateTask", () => {
    it("แก้เฉพาะช่องที่ส่งมา ช่องอื่นใช้ค่าเดิม", async () => {
      query
        .mockResolvedValueOnce([[row(3, "ชื่อเดิม", 0)], []] as never) // อ่านก่อนแก้
        .mockResolvedValueOnce([[row(3, "ชื่อเดิม", 1)], []] as never); // อ่านหลังแก้
      execute.mockResolvedValueOnce([{ affectedRows: 1 }, []] as never);

      const task = await taskService.updateTask(3, { done: true });

      expect(execute).toHaveBeenCalledWith(
        "UPDATE tasks SET title = ?, done = ? WHERE id = ?",
        ["ชื่อเดิม", true, 3],
      );
      expect(task?.done).toBe(true);
    });

    it("คืน null และไม่ UPDATE เมื่อไม่พบงาน", async () => {
      query.mockResolvedValueOnce([[], []] as never);

      expect(await taskService.updateTask(99, { done: true })).toBeNull();
      expect(execute).not.toHaveBeenCalled();
    });
  });

  describe("deleteTask", () => {
    it("คืน true เมื่อลบได้", async () => {
      execute.mockResolvedValueOnce([{ affectedRows: 1 }, []] as never);
      expect(await taskService.deleteTask(1)).toBe(true);
    });

    it("คืน false เมื่อไม่มีงานให้ลบ", async () => {
      execute.mockResolvedValueOnce([{ affectedRows: 0 }, []] as never);
      expect(await taskService.deleteTask(99)).toBe(false);
    });
  });
});
