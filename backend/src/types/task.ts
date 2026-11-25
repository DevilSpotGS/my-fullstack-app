// ชนิดข้อมูล (type) ของ "งาน" 1 รายการ
// ต้องตรงกับตาราง tasks ใน database/init.sql และกับ frontend/src/types/task.ts

export interface Task {
  id: number;
  title: string;
  done: boolean;
  createdAt: string; // วันเวลาแบบ ISO เช่น "2026-11-24T09:00:00.000Z"
}

// ข้อมูลที่รับเข้ามาตอนสร้างงานใหม่
export interface CreateTaskInput {
  title: string;
}

// ข้อมูลที่รับเข้ามาตอนแก้ไข (ส่งมาเฉพาะช่องที่ต้องการแก้)
export interface UpdateTaskInput {
  title?: string;
  done?: boolean;
}
