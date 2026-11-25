// ชนิดข้อมูลของ "งาน" ฝั่งหน้าเว็บ
// ต้องตรงกับที่ backend ส่งมา (backend/src/types/task.ts)

export interface Task {
  id: number;
  title: string;
  done: boolean;
  createdAt: string;
}
