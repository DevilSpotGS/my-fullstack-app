// page.tsx ในโฟลเดอร์ app/ = หน้าแรก (URL "/")
// หน้าใหม่: สร้างโฟลเดอร์ เช่น app/about/page.tsx → URL "/about"

import TaskList from "@/components/TaskList";

export default function HomePage() {
  return (
    <>
      <h1>📝 รายการงาน</h1>
      <p className="muted">
        หน้าเว็บ (Next.js) → API (Express) → ฐานข้อมูล (MySQL)
      </p>
      <TaskList />
    </>
  );
}
