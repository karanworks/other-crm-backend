const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const response = require("../utils/response");
const getToken = require("../utils/getToken");

class PaymentController {
  async paymentsGet(req, res) {
    try {
      const token = await getToken(req, res);

      if (token) {
        const { isActive } = await prisma.user.findFirst({
          where: {
            token: parseInt(token),
          },
        });

        if (isActive) {
          const loggedInUser = await prisma.user.findFirst({
            where: {
              token: parseInt(token),
            },
            select: {
              id: true,
              email: true,
              password: true,
              adminId: true,

              leads: true,
              dropdowns: true,
              invoices: {
                select: {
                  id: true,
                  clientName: true,
                  totalAmount: true,
                  balance: true,
                  paymentDueDate: true,
                  payments: true,
                },
              },
            },
          });

          const { password, ...adminDataWithoutPassword } = loggedInUser;

          response.success(res, "Payments fetched", {
            ...adminDataWithoutPassword,
          });
        } else {
          response.error(res, "User not active!");
        }
      } else {
        response.error(res, "user not already logged in.");
      }
    } catch (error) {
      console.log("error while getting payments", error);
    }
  }

  async paymentCreatePost(req, res) {
    try {
      const { paymentAmount, paymentDate } = req.body;
      const { invoiceId } = req.params;

      const token = await getToken(req, res);

      const adminUser = await prisma.user.findFirst({
        where: {
          token: parseInt(token),
        },
      });

      const newPayment = await prisma.payment.create({
        data: {
          paymentAmount,
          paymentDate,
          invoiceId: parseInt(invoiceId),
          addedBy: adminUser.id,
        },
      });

      const invoice = await prisma.invoice.findFirst({
        where: {
          id: parseInt(invoiceId),
        },
      });

      const invoicePayments = await prisma.payment.findMany({
        where: {
          invoiceId: parseInt(invoiceId),
        },
      });

      const totalPaidAmount = invoicePayments?.reduce((acc, curr) => {
        return acc + parseInt(curr.paymentAmount);
      }, 0);

      if (invoice) {
        await prisma.invoice.update({
          where: {
            id: parseInt(invoiceId),
          },
          data: {
            balance: invoice.totalAmount - totalPaidAmount,
          },
        });
      }
      response.success(res, "new payment created!", newPayment);
    } catch (error) {
      console.log("error while creating payment ->", error);
    }
  }

  async paymentUpdatePatch(req, res) {
    try {
      const { paymentAmount, paymentDate } = req.body;
      const { paymentId, invoiceId } = req.params;

      const token = await getToken(req, res);

      const adminUser = await prisma.user.findFirst({
        where: {
          token: parseInt(token),
        },
      });

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
              paymentAmount,
              paymentDate,
            },
          });

          const invoice = await prisma.invoice.findFirst({
            where: {
              id: parseInt(invoiceId),
            },
          });

          const invoicePayments = await prisma.payment.findMany({
            where: {
              invoiceId: parseInt(invoiceId),
            },
          });

          const totalPaidAmount = invoicePayments?.reduce((acc, curr) => {
            return acc + parseInt(curr.paymentAmount);
          }, 0);

          if (invoice) {
            await prisma.invoice.update({
              where: {
                id: parseInt(invoiceId),
              },
              data: {
                balance: invoice.totalAmount - totalPaidAmount,
              },
            });
          }

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
