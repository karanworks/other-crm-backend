const express = require("express");
const paymentRouter = express.Router({ mergeParams: true });
const PaymentController = require("../controllers/paymentController");

paymentRouter.get("/:invoiceId/payments", PaymentController.paymentsGet);
paymentRouter.post(
  "/invoice/:invoiceId/payment/create",
  PaymentController.paymentCreatePost
);
paymentRouter.patch(
  "/invoice/:invoiceId/payment/:paymentId/edit",
  PaymentController.paymentUpdatePatch
);
paymentRouter.delete(
  "/invoice/:invoiceId/payment/:paymentId/delete",
  PaymentController.paymentRemoveDelete
);

module.exports = paymentRouter;
