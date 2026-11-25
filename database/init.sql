-- ไฟล์นี้รันอัตโนมัติ "ครั้งแรก" ที่สร้างฐานข้อมูลใน Docker เท่านั้น
-- (ถ้าแก้ไฟล์นี้ภายหลัง ต้องลบข้อมูลเดิมด้วย: docker compose down -v)

-- ให้อ่านไฟล์นี้เป็น UTF-8 เพื่อให้ภาษาไทยไม่เพี้ยน
SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  done BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ข้อมูลตัวอย่าง
INSERT INTO tasks (title, done) VALUES
  ('ติดตั้ง Docker Desktop', TRUE),
  ('เชื่อม VS Code กับ Docker', FALSE),
  ('ลองเพิ่มงานใหม่จากหน้าเว็บ', FALSE);
