const express = require("express");
const taskRouter = express.Router({ mergeParams: true });
const TaskController = require("../controllers/taskController");

taskRouter.get("/tasks", TaskController.tasksGet);
taskRouter.get("/tasks/:searchQuery", TaskController.taskSearch);
taskRouter.post("/task/create", TaskController.taskCreatePost);
taskRouter.patch("/task/:taskId/edit", TaskController.taskUpdatePatch);

module.exports = taskRouter;
