/**
 * import all middlewares
 * import all function of cotroling
 */

import express from "express";
import { verifyAuthorization } from "../../utils/token.js";
import {
    addTask,
    updateTask,
    deleteTasks,
    getTasksWithUsers,
    overdueTasks,
} from "./tasks.controller.js";
import {
    validateAdd,
    validateUpdate,
    validateDelete,
} from "./tasksValidation.js";

const taskRouter = express.Router();

taskRouter.post("/tasks", verifyAuthorization, validateAdd, addTask);
taskRouter.patch("/tasks", verifyAuthorization, validateUpdate, updateTask);
taskRouter.delete("/tasks", verifyAuthorization, validateDelete, deleteTasks);
taskRouter.get("/taskswithusers", getTasksWithUsers);
taskRouter.get("/overduetasks", overdueTasks);

export default taskRouter;
