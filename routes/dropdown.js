const express = require("express");
const dropdownRouter = express.Router({ mergeParams: true });
const DropdownController = require("../controllers/dropdownController");

// dropdownRouter.get("/dropdowns", DropdownController.dropdownsGet);
dropdownRouter.post("/dropdown/create", DropdownController.dropdownCreatePost);

module.exports = dropdownRouter;
