// ROUTES = จับคู่ "URL + HTTP method" กับฟังก์ชันใน controller
// router นี้ถูกต่อไว้ที่ /api/tasks (ดู routes/index.ts)

import { Router } from "express";
import * as taskController from "../controllers/task.controller.js";

export const taskRouter = Router();

taskRouter.get("/", taskController.listTasks); //          GET    /api/tasks
taskRouter.get("/:id", taskController.getTask); //         GET    /api/tasks/5
taskRouter.post("/", taskController.createTask); //        POST   /api/tasks
taskRouter.patch("/:id", taskController.updateTask); //    PATCH  /api/tasks/5
taskRouter.delete("/:id", taskController.deleteTask); //   DELETE /api/tasks/5
