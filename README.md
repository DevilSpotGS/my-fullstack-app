# My Fullstack App

Next.js (หน้าเว็บ) + Express (API) + TypeScript + MySQL + Docker
ตัวอย่างในโปรเจกต์คือแอป "รายการงาน" (เพิ่ม / ติ๊กเสร็จ / ลบ) ที่ครบทุกชั้นตั้งแต่หน้าเว็บถึงฐานข้อมูล

```
เบราว์เซอร์ ──► frontend (Next.js :3000) ──fetch──► backend (Express :4000/api) ──SQL──► db (MySQL :3306)
```

## โครงสร้าง

```
my-fullstack-app/
├── package.json          สคริปต์รวม: npm run dev รันทั้ง frontend + backend
├── docker-compose.yml    รัน db + backend + frontend ด้วยคำสั่งเดียว
├── .env.example          ค่าตั้งค่าสำหรับ docker compose (คัดลอกเป็น .env)
├── database/
│   └── init.sql          สร้างตาราง tasks + ข้อมูลตัวอย่าง (รันครั้งแรกอัตโนมัติ)
├── backend/              API ด้วย Express + TypeScript
│   ├── Dockerfile
│   ├── .env.example      ค่าตั้งค่าตอนรันในเครื่อง (คัดลอกเป็น backend/.env)
│   └── src/
│       ├── index.ts              เริ่มเซิร์ฟเวอร์
│       ├── app.ts                ตั้งค่า Express + middleware
│       ├── config/env.ts         อ่านค่าจาก .env
│       ├── db/pool.ts            เชื่อมต่อ MySQL
│       ├── routes/               URL → controller
│       ├── controllers/          รับ req / ตอบ res / ตรวจข้อมูล
│       ├── services/             คุยกับฐานข้อมูล (SQL)
│       ├── middlewares/          จัดการ error และ 404
│       └── types/                ชนิดข้อมูล TypeScript
└── frontend/             หน้าเว็บด้วย Next.js (App Router) + TypeScript
    ├── Dockerfile
    ├── .env.local.example        URL ของ API (คัดลอกเป็น frontend/.env.local)
    ├── next.config.ts
    └── src/
        ├── app/                  หน้าเว็บ (layout.tsx, page.tsx, globals.css)
        ├── components/           ชิ้นส่วนหน้าเว็บ (TaskList.tsx)
        ├── lib/api.ts            ฟังก์ชันเรียก API ทั้งหมด
        └── types/                ชนิดข้อมูล TypeScript
```

## วิธีรัน

ต้องมี: Node.js 24 ขึ้นไป และ Docker Desktop

### แบบที่ 1: รันทุกอย่างใน Docker (ง่ายสุด)

```powershell
copy .env.example .env        # Mac/Linux ใช้ cp
docker compose up --build
```

เปิด http://localhost:3000 (หน้าเว็บ) และ http://localhost:4000/api/health (เช็ก API)
หยุด: กด Ctrl+C แล้ว `docker compose down`

### แบบที่ 2: พัฒนาในเครื่อง (แก้โค้ดแล้วเห็นผลทันที)

```powershell
copy .env.example .env
copy backend\.env.example backend\.env
copy frontend\.env.local.example frontend\.env.local
# แก้รหัสผ่านใน backend\.env ให้ตรงกับ MYSQL_PASSWORD ใน .env

npm install          # ติดตั้งไลบรารีทั้ง frontend และ backend
npm run db:up        # รันเฉพาะ MySQL ใน Docker
npm run dev          # รัน backend + frontend พร้อมกัน
```

## API

| Method | URL | ทำอะไร |
| --- | --- | --- |
| GET | /api/health | เช็กว่า API + ฐานข้อมูลทำงาน |
| GET | /api/tasks | ดึงงานทั้งหมด |
| GET | /api/tasks/:id | ดึงงาน 1 รายการ |
| POST | /api/tasks | สร้างงาน `{ "title": "..." }` |
| PATCH | /api/tasks/:id | แก้งาน `{ "title"?: "...", "done"?: true }` |
| DELETE | /api/tasks/:id | ลบงาน |
