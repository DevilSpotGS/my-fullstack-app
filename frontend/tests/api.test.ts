// ทดสอบ src/lib/api.ts: ส่ง request ถูกต้องไหม และจัดการคำตอบ/error จาก backend ยังไง
// ใช้ fetch ปลอม (ไม่ได้เรียก backend จริง)

import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "@/lib/api";
import type { Task } from "@/types/task";

const task: Task = { id: 1, title: "งานทดสอบ", done: false, createdAt: "2026-01-01T00:00:00.000Z" };

const fetchMock = vi.fn<typeof fetch>();

// สร้างคำตอบปลอมแบบ JSON
const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
});

// ดึง argument ที่ส่งให้ fetch ครั้งล่าสุด
function lastCall() {
  const [url, init] = fetchMock.mock.lastCall!;
  return { url, init: init! };
}

describe("api.getTasks", () => {
  it("เรียก GET /api/tasks แล้วคืนรายการงาน", async () => {
    fetchMock.mockResolvedValue(jsonResponse([task]));

    await expect(api.getTasks()).resolves.toEqual([task]);

    const { url, init } = lastCall();
    expect(url).toBe("http://api.test/api/tasks");
    expect(init.method).toBeUndefined(); // ไม่ระบุ = GET
    expect(init.cache).toBe("no-store");
    expect(init.headers).toMatchObject({ "Content-Type": "application/json" });
  });
});

describe("api.createTask", () => {
  it("ส่ง POST พร้อม title ใน body", async () => {
    fetchMock.mockResolvedValue(jsonResponse(task, 201));

    await expect(api.createTask("งานทดสอบ")).resolves.toEqual(task);

    const { url, init } = lastCall();
    expect(url).toBe("http://api.test/api/tasks");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body as string)).toEqual({ title: "งานทดสอบ" });
  });
});

describe("api.toggleTask", () => {
  it.each([
    { from: false, to: true },
    { from: true, to: false },
  ])("งาน done=$from → ส่ง PATCH done=$to", async ({ from, to }) => {
    fetchMock.mockResolvedValue(jsonResponse({ ...task, done: to }));

    await api.toggleTask({ ...task, done: from });

    const { url, init } = lastCall();
    expect(url).toBe("http://api.test/api/tasks/1");
    expect(init.method).toBe("PATCH");
    expect(JSON.parse(init.body as string)).toEqual({ done: to });
  });
});

describe("api.deleteTask", () => {
  it("ส่ง DELETE และคืน undefined เมื่อได้ 204 (ไม่มี body)", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));

    await expect(api.deleteTask(7)).resolves.toBeUndefined();

    const { url, init } = lastCall();
    expect(url).toBe("http://api.test/api/tasks/7");
    expect(init.method).toBe("DELETE");
  });
});

describe("เมื่อ API ตอบ error", () => {
  it("โยนข้อความ error ที่ backend ส่งมา", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ error: "ไม่พบงานนี้" }, 404));

    await expect(api.getTasks()).rejects.toThrow("ไม่พบงานนี้");
  });

  it("ถ้า body ไม่ใช่ JSON ใช้ข้อความกลางพร้อม status code", async () => {
    fetchMock.mockResolvedValue(new Response("<html>Bad Gateway</html>", { status: 502 }));

    await expect(api.getTasks()).rejects.toThrow("เรียก API ไม่สำเร็จ (502)");
  });

  it("ถ้า JSON ไม่มีช่อง error ใช้ข้อความกลางพร้อม status code", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ message: "oops" }, 500));

    await expect(api.getTasks()).rejects.toThrow("เรียก API ไม่สำเร็จ (500)");
  });

  it("ถ้าต่อ backend ไม่ได้เลย (network error) ส่ง error ต่อออกไป", async () => {
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));

    await expect(api.getTasks()).rejects.toThrow("Failed to fetch");
  });
});
