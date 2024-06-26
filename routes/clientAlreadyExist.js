const express = require("express");
const clientAlreadyExistRouter = express.Router({ mergeParams: true });
const ClientAlreadyExistController = require("../controllers/clientAlreadyExistController");

clientAlreadyExistRouter.post(
  "/client-already-exist",
  ClientAlreadyExistController.clientAlreadyExistPost
);

module.exports = clientAlreadyExistRouter;
