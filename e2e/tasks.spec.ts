// E2E test หน้า "รายการงาน" (frontend/src/components/TaskList.tsx)
// ชุดแรกใช้ API + MySQL จริง / ชุดหลังจำลอง API เพื่อเทสกรณีที่ทำซ้ำยาก
import { test, expect, type Page } from "@playwright/test";

// ตั้งชื่องานไม่ซ้ำกัน กันชนกับข้อมูลที่มีอยู่แล้วในฐานข้อมูล
const uniqueTitle = (label: string) => `[E2E] ${label} ${Date.now()}`;

const input = (page: Page) => page.getByPlaceholder("พิมพ์งานใหม่ แล้วกด Enter");
const taskItem = (page: Page, title: string) =>
  page.getByRole("listitem").filter({ hasText: title });

test.describe("ใช้ API จริง", () => {
  test("เปิดหน้าแรกแล้วเห็นหัวข้อและฟอร์ม", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /รายการงาน/ })).toBeVisible();
    await expect(input(page)).toBeVisible();
    await expect(page.getByRole("button", { name: "เพิ่ม" })).toBeVisible();
    await expect(page.getByText("กำลังโหลด...")).toBeHidden(); // โหลดเสร็จแล้ว
  });

  test("เพิ่ม → ติ๊กเสร็จ → ยกเลิกติ๊ก → ลบงาน", async ({ page }) => {
    const title = uniqueTitle("flow");
    await page.goto("/");

    // เพิ่มงานด้วยการกด Enter
    await input(page).fill(title);
    await input(page).press("Enter");
    const item = taskItem(page, title);
    await expect(item).toBeVisible();
    await expect(input(page)).toHaveValue(""); // ช่องถูกล้างหลังเพิ่ม

    // ติ๊กเสร็จ แล้วรีโหลดเพื่อเช็คว่าบันทึกลงฐานข้อมูลจริง
    // ใช้ click() แทน check(): checkbox นี้เป็น controlled จะเปลี่ยนก็ต่อเมื่อ API ตอบกลับแล้ว
    // check() เช็คสถานะทันทีหลังคลิกจึงพัง ส่วน expect() จะรอจนกว่าจะเปลี่ยน
    await item.getByRole("checkbox").click();
    await expect(item.getByRole("checkbox")).toBeChecked();
    await expect(item).toHaveClass(/done/);
    await page.reload();
    await expect(taskItem(page, title)).toHaveClass(/done/);

    // ยกเลิกติ๊ก
    await taskItem(page, title).getByRole("checkbox").click();
    await expect(taskItem(page, title).getByRole("checkbox")).not.toBeChecked();
    await expect(taskItem(page, title)).not.toHaveClass(/done/);

    // ลบ แล้วรีโหลดเพื่อเช็คว่าหายจากฐานข้อมูลจริง
    await taskItem(page, title).getByRole("button", { name: "ลบ" }).click();
    await expect(taskItem(page, title)).toHaveCount(0);
    await page.reload();
    await expect(taskItem(page, title)).toHaveCount(0);
  });

  test("กดเพิ่มตอนช่องว่าง หรือมีแต่ช่องว่าง จะไม่เพิ่มงาน", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("กำลังโหลด...")).toBeHidden();
    const before = await page.getByRole("listitem").count();

    await page.getByRole("button", { name: "เพิ่ม" }).click();
    await input(page).fill("    ");
    await input(page).press("Enter");

    await expect(page.getByRole("listitem")).toHaveCount(before);
  });
});

test.describe("จำลอง API (mock)", () => {
  test("ไม่มีงานเลย แสดงข้อความ 'ยังไม่มีงาน'", async ({ page }) => {
    await page.route("**/api/tasks", (route) => route.fulfill({ json: [] }));
    await page.goto("/");
    await expect(page.getByText("ยังไม่มีงาน")).toBeVisible();
  });

  test("API ล่ม แสดงข้อความ error จาก backend", async ({ page }) => {
    await page.route("**/api/tasks", (route) =>
      route.fulfill({ status: 500, json: { error: "ฐานข้อมูลไม่พร้อมใช้งาน" } }),
    );
    await page.goto("/");
    await expect(page.getByText("ฐานข้อมูลไม่พร้อมใช้งาน")).toBeVisible();
    await expect(page.getByText("ยังไม่มีงาน")).toBeHidden();
  });
});
