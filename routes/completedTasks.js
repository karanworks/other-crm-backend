const express = require("express");
const completedTasksRouter = express.Router({ mergeParams: true });
const CompletedTasksController = require("../controllers/completedTasksController");

completedTasksRouter.get(
  "/completed-tasks",
  CompletedTasksController.completedTasksGet
);

module.exports = completedTasksRouter;
