const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const response = require("../utils/response");
const getToken = require("../utils/getToken");

class PaymentController {
  async paymentCreatePost(req, res) {
    try {
      const { amount, date } = req.body;
      const { invoiceId } = req.params;

      const token = await getToken(req, res);

      const adminUser = await prisma.user.findFirst({
        where: {
          token: parseInt(token),
        },
      });

      const newPayment = await prisma.payment.create({
        data: {
          amount,
          date,
          invoiceId,
          addedBy: adminUser.id,
        },
      });

      response.success(res, "new payment created!", newPayment);
    } catch (error) {
      console.log("error while creating payment ->", error);
    }
  }

  async paymentUpdatePatch(req, res) {
    try {
      const { amount, date } = req.body;
      const { paymentId, invoiceId } = req.params;

      const token = await getToken(req, res);

      const adminUser = await prisma.user.findFirst({
        where: {
          token: parseInt(token),
        },
      });

      // finding campaign from id
      const paymentFound = await prisma.payment.findFirst({
        where: {
          id: parseInt(paymentId),
          invoiceId: parseInt(invoiceId),
        },
      });

      if (adminUser) {
        if (paymentFound) {
          const updatedPayment = await prisma.payment.update({
            where: {
              id: parseInt(paymentId),
            },
            data: {
              amount,
              date,
            },
          });

          response.success(res, "Payment updated successfully", {
            updatedPayment,
          });
        } else {
          response.error(res, "Payment not found!");
        }
      } else {
        response.error(res, "User not found!");
      }
    } catch (error) {
      console.log("error while updating payment ", error);
    }
  }
  async paymentRemoveDelete(req, res) {
    try {
      const { paymentId, invoiceId } = req.params;

      const paymentFound = await prisma.payment.findFirst({
        where: {
          id: parseInt(paymentId),
          invoiceId: parseInt(invoiceId),
        },
      });

      if (paymentFound) {
        const deletedPayment = await prisma.payment.delete({
          where: {
            id: parseInt(paymentId),
          },
        });

        response.success(res, "Payment deleted successfully!", {
          deletedPayment,
        });
      } else {
        response.error(res, "payment does not exist!");
      }
    } catch (error) {
      console.log("error while deleting payment ", error);
    }
  }
}

module.exports = new PaymentController();
