// การเชื่อมต่อ MySQL
// ใช้ "pool" = เปิดการเชื่อมต่อเตรียมไว้หลายเส้น แล้วหยิบมาใช้ซ้ำ เร็วกว่าเปิดใหม่ทุกครั้ง

import mysql from "mysql2/promise";
import { env } from "../config/env.js";

export const pool = mysql.createPool({
  host: env.db.host,
  port: env.db.port,
  user: env.db.user,
  password: env.db.password,
  database: env.db.database,
  connectionLimit: 10,
  charset: "utf8mb4", // รองรับภาษาไทยและอีโมจิ
});

// ใช้ตอนเปิดเซิร์ฟเวอร์ เพื่อเช็กว่าต่อฐานข้อมูลได้จริง
export async function checkDatabaseConnection(): Promise<void> {
  const connection = await pool.getConnection();
  await connection.ping();
  connection.release();
}
