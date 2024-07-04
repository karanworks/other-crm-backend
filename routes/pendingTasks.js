const express = require("express");
const pendingTasksRouter = express.Router({ mergeParams: true });
const PendingTasksController = require("../controllers/pendingTasksController");

pendingTasksRouter.get(
  "/pending-tasks",
  PendingTasksController.pendingTasksGet
);
pendingTasksRouter.get(
  "/pending-tasks/:searchQuery",
  PendingTasksController.pendingTaskSearch
);

module.exports = pendingTasksRouter;
