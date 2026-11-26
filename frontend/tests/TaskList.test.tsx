// ทดสอบ component TaskList: แสดงผลถูกไหม และกดปุ่ม/พิมพ์แล้วเกิดอะไรขึ้น
// จำลอง src/lib/api.ts ทั้งไฟล์ ไม่ได้เรียก backend จริง

import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import TaskList from "@/components/TaskList";
import { api } from "@/lib/api";
import type { Task } from "@/types/task";

vi.mock("@/lib/api", () => ({
  api: {
    getTasks: vi.fn(),
    createTask: vi.fn(),
    toggleTask: vi.fn(),
    deleteTask: vi.fn(),
  },
}));

const mockedApi = vi.mocked(api);

const makeTask = (id: number, title: string, done = false): Task => ({
  id,
  title,
  done,
  createdAt: "2026-01-01T00:00:00.000Z",
});

const input = () => screen.getByPlaceholderText("พิมพ์งานใหม่ แล้วกด Enter");
const addButton = () => screen.getByRole("button", { name: "เพิ่ม" });
const itemOf = (title: string) => screen.getByText(title).closest("li")!;

// render แล้วรอจนโหลดรายการงานเสร็จ
async function renderLoaded(tasks: Task[]) {
  mockedApi.getTasks.mockResolvedValue(tasks);
  const user = userEvent.setup();
  render(<TaskList />);
  await waitFor(() => expect(screen.queryByText("กำลังโหลด...")).not.toBeInTheDocument());
  return user;
}

beforeEach(() => {
  mockedApi.getTasks.mockReset();
  mockedApi.createTask.mockReset();
  mockedApi.toggleTask.mockReset();
  mockedApi.deleteTask.mockReset();
});

describe("ตอนโหลดหน้า", () => {
  it("แสดง 'กำลังโหลด...' ระหว่างรอ API", () => {
    mockedApi.getTasks.mockReturnValue(new Promise(() => {})); // ไม่ตอบกลับเลย
    render(<TaskList />);

    expect(screen.getByText("กำลังโหลด...")).toBeInTheDocument();
    expect(screen.queryByText("ยังไม่มีงาน")).not.toBeInTheDocument();
  });

  it("แสดงรายการงานตามลำดับที่ได้จาก API และติ๊กงานที่เสร็จแล้ว", async () => {
    await renderLoaded([makeTask(2, "งานที่สอง", true), makeTask(1, "งานแรก")]);

    const items = screen.getAllByRole("listitem");
    expect(items.map((li) => li.textContent)).toEqual(["งานที่สอง✕", "งานแรก✕"]);

    expect(within(itemOf("งานที่สอง")).getByRole("checkbox")).toBeChecked();
    expect(itemOf("งานที่สอง")).toHaveClass("done");
    expect(within(itemOf("งานแรก")).getByRole("checkbox")).not.toBeChecked();
    expect(itemOf("งานแรก")).not.toHaveClass("done");
    expect(mockedApi.getTasks).toHaveBeenCalledTimes(1);
  });

  it("ไม่มีงานเลย แสดง 'ยังไม่มีงาน'", async () => {
    await renderLoaded([]);

    expect(screen.getByText("ยังไม่มีงาน")).toBeInTheDocument();
    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
  });

  it("โหลดไม่สำเร็จ แสดงข้อความ error และไม่แสดง 'ยังไม่มีงาน'", async () => {
    mockedApi.getTasks.mockRejectedValue(new Error("ฐานข้อมูลไม่พร้อมใช้งาน"));
    render(<TaskList />);

    expect(await screen.findByText(/ฐานข้อมูลไม่พร้อมใช้งาน/)).toBeInTheDocument();
    expect(screen.queryByText("กำลังโหลด...")).not.toBeInTheDocument();
    expect(screen.queryByText("ยังไม่มีงาน")).not.toBeInTheDocument();
  });
});

describe("เพิ่มงาน", () => {
  it("กด Enter แล้วงานใหม่ขึ้นบนสุด และช่องพิมพ์ถูกล้าง", async () => {
    const user = await renderLoaded([makeTask(1, "งานเดิม")]);
    mockedApi.createTask.mockResolvedValue(makeTask(2, "งานใหม่"));

    await user.type(input(), "งานใหม่{Enter}");

    expect(mockedApi.createTask).toHaveBeenCalledWith("งานใหม่");
    await waitFor(() => expect(screen.getAllByRole("listitem")[0]).toHaveTextContent("งานใหม่"));
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(input()).toHaveValue("");
  });

  it("กดปุ่ม 'เพิ่ม' ก็เพิ่มได้เหมือนกัน", async () => {
    const user = await renderLoaded([]);
    mockedApi.createTask.mockResolvedValue(makeTask(1, "จากปุ่ม"));

    await user.type(input(), "จากปุ่ม");
    await user.click(addButton());

    expect(await screen.findByText("จากปุ่ม")).toBeInTheDocument();
    expect(screen.queryByText("ยังไม่มีงาน")).not.toBeInTheDocument();
  });

  it.each([
    { label: "ช่องว่างเปล่า", text: "" },
    { label: "มีแต่ช่องว่าง", text: "    " },
  ])("$label → ไม่เรียก API", async ({ text }) => {
    const user = await renderLoaded([]);

    if (text) await user.type(input(), text);
    await user.click(addButton());

    expect(mockedApi.createTask).not.toHaveBeenCalled();
  });

  it("ช่องพิมพ์จำกัดความยาว 255 ตัวอักษร (เท่ากับคอลัมน์ในฐานข้อมูล)", async () => {
    await renderLoaded([]);
    expect(input()).toHaveAttribute("maxLength", "255");
  });

  it("เพิ่มไม่สำเร็จ แสดง error และเก็บข้อความที่พิมพ์ไว้ให้ลองใหม่", async () => {
    const user = await renderLoaded([]);
    mockedApi.createTask.mockRejectedValue(new Error("กรุณาใส่ชื่องาน"));

    await user.type(input(), "งานที่พัง{Enter}");

    expect(await screen.findByText(/กรุณาใส่ชื่องาน/)).toBeInTheDocument();
    expect(input()).toHaveValue("งานที่พัง");
    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
  });

  it("เพิ่มสำเร็จหลังจาก error แล้ว ข้อความ error หายไป", async () => {
    const user = await renderLoaded([]);
    mockedApi.createTask
      .mockRejectedValueOnce(new Error("เน็ตหลุด"))
      .mockResolvedValueOnce(makeTask(1, "ลองใหม่"));

    await user.type(input(), "ลองใหม่{Enter}");
    expect(await screen.findByText(/เน็ตหลุด/)).toBeInTheDocument();

    await user.click(addButton());
    expect(await screen.findByText("ลองใหม่")).toBeInTheDocument();
    expect(screen.queryByText(/เน็ตหลุด/)).not.toBeInTheDocument();
  });
});

describe("ติ๊กงานเสร็จ / ยกเลิก", () => {
  it("คลิก checkbox แล้วส่งงานนั้นไปให้ API และอัปเดตตามที่ API ตอบ", async () => {
    const task = makeTask(1, "งานแรก");
    const user = await renderLoaded([task, makeTask(2, "งานอื่น")]);
    mockedApi.toggleTask.mockResolvedValue({ ...task, done: true });

    await user.click(within(itemOf("งานแรก")).getByRole("checkbox"));

    expect(mockedApi.toggleTask).toHaveBeenCalledWith(task);
    await waitFor(() => expect(itemOf("งานแรก")).toHaveClass("done"));
    expect(within(itemOf("งานแรก")).getByRole("checkbox")).toBeChecked();
    expect(itemOf("งานอื่น")).not.toHaveClass("done"); // งานอื่นไม่โดนด้วย
  });

  it("ยกเลิกติ๊กงานที่เสร็จแล้ว", async () => {
    const task = makeTask(1, "เสร็จแล้ว", true);
    const user = await renderLoaded([task]);
    mockedApi.toggleTask.mockResolvedValue({ ...task, done: false });

    await user.click(within(itemOf("เสร็จแล้ว")).getByRole("checkbox"));

    await waitFor(() => expect(itemOf("เสร็จแล้ว")).not.toHaveClass("done"));
    expect(within(itemOf("เสร็จแล้ว")).getByRole("checkbox")).not.toBeChecked();
  });

  it("checkbox ยังไม่เปลี่ยนจนกว่า API จะตอบกลับ", async () => {
    const task = makeTask(1, "รอ API");
    const user = await renderLoaded([task]);
    let respond!: (t: Task) => void;
    mockedApi.toggleTask.mockReturnValue(new Promise((r) => (respond = r)));

    const checkbox = within(itemOf("รอ API")).getByRole("checkbox");
    await user.click(checkbox);
    expect(checkbox).not.toBeChecked(); // ยังรออยู่

    respond({ ...task, done: true });
    await waitFor(() => expect(checkbox).toBeChecked());
  });

  it("API error แสดงข้อความ และสถานะ checkbox ไม่เปลี่ยน", async () => {
    const user = await renderLoaded([makeTask(1, "งานแรก")]);
    mockedApi.toggleTask.mockRejectedValue(new Error("ไม่พบงานนี้"));

    await user.click(within(itemOf("งานแรก")).getByRole("checkbox"));

    expect(await screen.findByText(/ไม่พบงานนี้/)).toBeInTheDocument();
    expect(within(itemOf("งานแรก")).getByRole("checkbox")).not.toBeChecked();
  });
});

describe("ลบงาน", () => {
  it("กดปุ่มลบแล้วเรียก API ด้วย id ที่ถูก และงานนั้นหายไป", async () => {
    const user = await renderLoaded([makeTask(1, "เก็บไว้"), makeTask(2, "ลบทิ้ง")]);
    mockedApi.deleteTask.mockResolvedValue(undefined);

    await user.click(within(itemOf("ลบทิ้ง")).getByRole("button", { name: "ลบ" }));

    expect(mockedApi.deleteTask).toHaveBeenCalledWith(2);
    await waitFor(() => expect(screen.queryByText("ลบทิ้ง")).not.toBeInTheDocument());
    expect(screen.getByText("เก็บไว้")).toBeInTheDocument();
  });

  it("ลบงานสุดท้าย แสดง 'ยังไม่มีงาน'", async () => {
    const user = await renderLoaded([makeTask(1, "งานเดียว")]);
    mockedApi.deleteTask.mockResolvedValue(undefined);

    await user.click(screen.getByRole("button", { name: "ลบ" }));

    expect(await screen.findByText("ยังไม่มีงาน")).toBeInTheDocument();
  });

  it("ลบไม่สำเร็จ แสดง error และงานยังอยู่", async () => {
    const user = await renderLoaded([makeTask(1, "ลบไม่ได้")]);
    mockedApi.deleteTask.mockRejectedValue(new Error("ฐานข้อมูลไม่พร้อมใช้งาน"));

    await user.click(screen.getByRole("button", { name: "ลบ" }));

    expect(await screen.findByText(/ฐานข้อมูลไม่พร้อมใช้งาน/)).toBeInTheDocument();
    expect(screen.getByText("ลบไม่ได้")).toBeInTheDocument();
  });
});
