const express = require("express");
const pendingTasksRouter = express.Router({ mergeParams: true });
const PendingTasksController = require("../controllers/pendingTasksController");

pendingTasksRouter.get(
  "/pending-tasks",
  PendingTasksController.pendingTasksGet
);

module.exports = pendingTasksRouter;
