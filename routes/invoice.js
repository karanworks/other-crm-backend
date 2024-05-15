const express = require("express");
const invoiceRouter = express.Router({ mergeParams: true });
const InvoiceController = require("../controllers/invoiceController");

invoiceRouter.get("/invoices", InvoiceController.invoicesGet);
invoiceRouter.post("/invoice/create", InvoiceController.invoiceCreatePost);
invoiceRouter.patch(
  "/invoice/:invoiceId/edit",
  InvoiceController.invoiceUpdatePatch
);
invoiceRouter.delete(
  "/invoice/:invoiceId/delete",
  InvoiceController.invoiceRemoveDelete
);

module.exports = invoiceRouter;
