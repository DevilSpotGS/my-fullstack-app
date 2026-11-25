// รวมค่าตั้งค่าทั้งหมดจาก environment variables ไว้ที่เดียว
// ไฟล์อื่นเรียกใช้ผ่าน `env` แทนการอ่าน process.env ตรงๆ

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`ไม่พบค่า ${name} ใน environment (ดูตัวอย่างที่ .env.example)`);
  }
  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 4000),
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
  db: {
    host: process.env.DB_HOST ?? "localhost",
    port: Number(process.env.DB_PORT ?? 3306),
    user: required("DB_USER"),
    password: required("DB_PASSWORD"),
    database: required("DB_NAME"),
  },
};
