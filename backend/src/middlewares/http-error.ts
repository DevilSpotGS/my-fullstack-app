// Error ที่รู้ว่าควรตอบกลับด้วย HTTP status อะไร
// ใช้ใน controller เช่น: throw new HttpError(404, "ไม่พบงานนี้")

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "HttpError";
  }
}
