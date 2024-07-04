const express = require("express");
const completedTasksRouter = express.Router({ mergeParams: true });
const CompletedTasksController = require("../controllers/completedTasksController");

completedTasksRouter.get(
  "/completed-tasks",
  CompletedTasksController.completedTasksGet
);
completedTasksRouter.get(
  "/completed-tasks/:searchQuery",
  CompletedTasksController.searchCompletedTasks
);

module.exports = completedTasksRouter;
