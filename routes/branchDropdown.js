const express = require("express");
const branchDropdownRouter = express.Router({ mergeParams: true });
const BranchDropdownController = require("../controllers/branchDropdownController");

branchDropdownRouter.get(
  "/branch-dropdown/",
  BranchDropdownController.branchDropdownGet
);
branchDropdownRouter.post(
  "/branch-dropdown/create",
  BranchDropdownController.branchDropdownCreatePost
);

module.exports = branchDropdownRouter;
