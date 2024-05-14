const express = require("express");
const addLeadRouter = express.Router({ mergeParams: true });
const AddLeadController = require("../controllers/leadController");

addLeadRouter.post("/lead/create", AddLeadController.leadCreatePost);
addLeadRouter.patch("/lead/:leadId/edit", AddLeadController.leadUpdatePatch);
addLeadRouter.delete(
  "/lead/:leadId/delete",
  AddLeadController.leadRemoveDelete
);

module.exports = addLeadRouter;
