const express = require("express");
const leadRouter = express.Router({ mergeParams: true });
const LeadController = require("../controllers/leadController");

leadRouter.get("/leads", LeadController.leadsGet);
leadRouter.post("/lead/create", LeadController.leadCreatePost);
leadRouter.patch("/lead/:leadId/edit", LeadController.leadUpdatePatch);

module.exports = leadRouter;
