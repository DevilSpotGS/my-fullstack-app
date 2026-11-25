// SERVICE = ชั้นที่คุยกับฐานข้อมูล
// มีแค่การอ่าน/เขียนข้อมูล ไม่รู้จัก req/res ของ Express (จึงนำไปใช้ซ้ำหรือทดสอบได้ง่าย)

import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { pool } from "../db/pool.js";
import type { CreateTaskInput, Task, UpdateTaskInput } from "../types/task.js";

// หน้าตาแถวที่ได้จาก MySQL (ชื่อคอลัมน์แบบ snake_case)
interface TaskRow extends RowDataPacket {
  id: number;
  title: string;
  done: number; // MySQL เก็บ BOOLEAN เป็น 0 หรือ 1
  created_at: Date;
}

// แปลงแถวจากฐานข้อมูล → รูปแบบที่ส่งให้ frontend (camelCase)
function toTask(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    done: Boolean(row.done),
    createdAt: row.created_at.toISOString(),
  };
}

export async function findAllTasks(): Promise<Task[]> {
  const [rows] = await pool.query<TaskRow[]>(
    "SELECT id, title, done, created_at FROM tasks ORDER BY id DESC",
  );
  return rows.map(toTask);
}

export async function findTaskById(id: number): Promise<Task | null> {
  // ใช้ ? แทนการต่อสตริงเสมอ ป้องกัน SQL injection
  const [rows] = await pool.query<TaskRow[]>(
    "SELECT id, title, done, created_at FROM tasks WHERE id = ?",
    [id],
  );
  const row = rows.at(0);
  return row ? toTask(row) : null;
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const [result] = await pool.execute<ResultSetHeader>(
    "INSERT INTO tasks (title) VALUES (?)",
    [input.title],
  );
  const created = await findTaskById(result.insertId);
  if (!created) throw new Error("สร้างงานไม่สำเร็จ");
  return created;
}

export async function updateTask(id: number, input: UpdateTaskInput): Promise<Task | null> {
  const existing = await findTaskById(id);
  if (!existing) return null;

  const title = input.title ?? existing.title;
  const done = input.done ?? existing.done;
  await pool.execute("UPDATE tasks SET title = ?, done = ? WHERE id = ?", [title, done, id]);
  return findTaskById(id);
}

export async function deleteTask(id: number): Promise<boolean> {
  const [result] = await pool.execute<ResultSetHeader>("DELETE FROM tasks WHERE id = ?", [id]);
  return result.affectedRows > 0;
}
