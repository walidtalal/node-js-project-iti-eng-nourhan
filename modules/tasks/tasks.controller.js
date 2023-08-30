import User from "../../schemas/users.schema.js";
import Task from "../../schemas/tasks.schema.js";

import { createAuthorization } from "../../utils/token.js";

const serverError = (error, res) => {
    res.status(500).json({
        message:
            "can't complete your request right now, please try again later",
    });
    console.log(error);
};

const checkUserStatus = async (userID) => {
    const user = await User.findById(userID);
    if (!user || user.isDeleted) {
        return {
            status: user?.isDeleted ? 403 : 404,
            message: user?.isDeleted
                ? "Your account has been deleted, please contact support"
                : "Can't find your account, or your account has been deleted",
            token: user?.isDeleted
                ? createAuthorization({ id: user._id }, "1s")
                : null,
        };
    }
    return { status: 200 };
};

const addTask = async (req, res) => {
    const {
        userID,
        body: { title, description, assignTo, deadline },
    } = req;

    try {
        const userStatus = await checkUserStatus(userID);
        if (userStatus.status !== 200) {
            return res.status(userStatus.status).json({
                message: userStatus.message,
                token: userStatus.token,
            });
        }

        const task = await Task.create({
            title,
            description,
            status: "nodejsproject",
            userID,
            assignTo,
            deadline,
        });
        res.status(200).json({
            message: "The task is added successfully",
            task,
        });
    } catch (error) {
        serverError(error, res);
    }
};

const updateTask = async (req, res) => {
    const {
        userID,
        body: { id, title, description, status },
    } = req;

    try {
        const userStatus = await checkUserStatus(userID);
        if (userStatus.status !== 200) {
            return res.status(userStatus.status).json({
                message: userStatus.message,
                token: userStatus.token,
            });
        }

        const task = await Task.findById(id);
        if (!task) {
            return res.status(404).json({ message: "Task is not found" });
        }

        if (task.userID.toString() !== userID) {
            return res.status(400).json({
                message: "You don't have permission to update this task",
            });
        }

        const updatedData = {};
        if (title) updatedData.title = title;
        if (description) updatedData.description = description;
        if (status) updatedData.status = status;

        const updated = await Task.findByIdAndUpdate(
            id,
            { $set: updatedData },
            { new: true }
        );
        res.json({
            message: "Task is updated successfully",
            updatedTask: updated,
        });
    } catch (error) {
        serverError(error, res);
    }
};

const deleteTasks = async (req, res) => {
    const {
        userID,
        body: { id },
    } = req;

    try {
        const userStatus = await checkUserStatus(userID);
        if (userStatus.status !== 200) {
            return res.status(userStatus.status).json({
                message: userStatus.message,
                token: userStatus.token,
            });
        }

        const task = await Task.findById(id);
        if (!task) {
            return res.status(404).json({ message: "Task is not found" });
        }

        if (task.userID.toString() !== userID) {
            return res.status(400).json({
                message: "You don't have permission to delete this task",
            });
        }

        const deleted = await Task.findByIdAndDelete(id);
        res.json({
            message: "Task is deleted successfully",
            deletedTask: deleted,
        });
    } catch (error) {
        serverError(error, res);
    }
};

const getTasksWithUsers = async (_, res) => {
    try {
        const tasks = await Task.find().populate(
            "userID",
            "_id name age gender phone"
        );
        const message = tasks.length
            ? "Tasks are retrieved successfully"
            : "There are no tasks found to retrieve";

        res.status(200).json({ message, tasks });
    } catch (error) {
        serverError(error, res);
    }
};

const overdueTasks = async (_, res) => {
    try {
        const currentDate = new Date();
        const tasks = await Task.find({
            status: { $ne: "done" },
            deadline: { $lt: currentDate },
        });
        const message = tasks.length
            ? "Tasks are retrieved successfully"
            : "There are no tasks found to retrieve";

        res.status(200).json({ message, tasks });
    } catch (error) {
        serverError(error, res);
    }
};

export { addTask, updateTask, deleteTasks, getTasksWithUsers, overdueTasks };
