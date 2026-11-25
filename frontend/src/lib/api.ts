// รวมทุกการเรียก API ไว้ที่ไฟล์นี้ไฟล์เดียว
// component เรียกฟังก์ชันพวกนี้ แทนการเขียน fetch เองทุกที่

import type { Task } from "@/types/task";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

// ตัวช่วยกลาง: เรียก API แล้วแปลงผลเป็น JSON ถ้า error ก็โยนข้อความจาก backend ออกมา
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}/api${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
    cache: "no-store", // ข้อมูลเปลี่ยนบ่อย ไม่ต้องเก็บ cache
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error ?? `เรียก API ไม่สำเร็จ (${response.status})`);
  }
  if (response.status === 204) return undefined as T; // ลบสำเร็จ ไม่มีข้อมูลกลับมา
  return response.json() as Promise<T>;
}

export const api = {
  getTasks: () => request<Task[]>("/tasks"),

  createTask: (title: string) =>
    request<Task>("/tasks", { method: "POST", body: JSON.stringify({ title }) }),

  toggleTask: (task: Task) =>
    request<Task>(`/tasks/${task.id}`, {
      method: "PATCH",
      body: JSON.stringify({ done: !task.done }),
    }),

  deleteTask: (id: number) => request<void>(`/tasks/${id}`, { method: "DELETE" }),
};
