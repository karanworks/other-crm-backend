const express = require("express");
const eventRouter = express.Router({ mergeParams: true });
const EventController = require("../controllers/eventController");

eventRouter.get("/:taskId/events", EventController.eventsGet);
eventRouter.post("/event/create", EventController.eventCreatePost);
eventRouter.patch("/event/:eventId/edit", EventController.eventUpdatePatch);
// eventRouter.delete("/event/:eventId/delete", EventController.eventRemoveDelete);

module.exports = eventRouter;
