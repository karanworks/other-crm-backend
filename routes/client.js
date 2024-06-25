const express = require("express");
const clientRouter = express.Router({ mergeParams: true });
const ClientController = require("../controllers/clientController");

clientRouter.get("/clients", ClientController.clientsGet);
clientRouter.post("/client/create", ClientController.clientCreatePost);
clientRouter.patch(
  "/client/:clientId/edit",
  ClientController.clientUpdatePatch
);

module.exports = clientRouter;
