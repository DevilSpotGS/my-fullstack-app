// "use client" = component นี้ทำงานในเบราว์เซอร์ (ใช้ useState, onClick ได้)
// ถ้าไม่ใส่ Next.js จะถือว่าเป็น Server Component ซึ่งใช้ state หรือ event ไม่ได้
"use client";

import { useEffect, useState, type FormEvent } from "react";
import { api } from "@/lib/api";
import type { Task } from "@/types/task";

export default function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // โหลดรายการงานครั้งแรกที่หน้าเว็บเปิดขึ้นมา
  useEffect(() => {
    api
      .getTasks()
      .then(setTasks)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleAdd(event: FormEvent) {
    event.preventDefault(); // ไม่ให้ฟอร์มรีเฟรชหน้า
    if (!newTitle.trim()) return;
    try {
      const created = await api.createTask(newTitle);
      setTasks((prev) => [created, ...prev]);
      setNewTitle("");
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function handleToggle(task: Task) {
    try {
      const updated = await api.toggleTask(task);
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function handleDelete(id: number) {
    try {
      await api.deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <section className="card">
      <form onSubmit={handleAdd} className="add-form">
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="พิมพ์งานใหม่ แล้วกด Enter"
          maxLength={255}
        />
        <button type="submit">เพิ่ม</button>
      </form>

      {error && <p className="error">⚠️ {error}</p>}
      {loading && <p className="muted">กำลังโหลด...</p>}
      {!loading && tasks.length === 0 && !error && <p className="muted">ยังไม่มีงาน</p>}

      <ul className="task-list">
        {tasks.map((task) => (
          <li key={task.id} className={task.done ? "done" : ""}>
            <label>
              <input type="checkbox" checked={task.done} onChange={() => handleToggle(task)} />
              <span>{task.title}</span>
            </label>
            <button className="delete" onClick={() => handleDelete(task.id)} aria-label="ลบ">
              ✕
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
