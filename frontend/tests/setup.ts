// รันก่อนไฟล์ test ทุกไฟล์

// เพิ่ม matcher สำหรับ DOM เช่น toBeInTheDocument(), toBeChecked(), toHaveClass()
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// ล้างหน้าจอที่ render ไว้หลังจบแต่ละ test ไม่ให้ test ถัดไปเห็นของเก่า
afterEach(() => cleanup());
