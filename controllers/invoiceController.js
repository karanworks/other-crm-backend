const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const response = require("../utils/response");
const getToken = require("../utils/getToken");
class InvoiceController {
  async invoicesGet(req, res) {
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
              roleId: true,

              dropdowns: true,
              invoices: {
                select: {
                  id: true,
                  clientId: true,
                  taskId: true,
                  clientName: true,
                  totalAmount: true,
                  balance: true,
                  paymentDueDate: true,
                  payments: true,
                  taskName: true,
                },
              },
            },
          });

          const { password, ...adminDataWithoutPassword } = loggedInUser;

          response.success(res, "Invoices fetched", {
            ...adminDataWithoutPassword,
          });
        } else {
          response.error(res, "User not active!");
        }
      } else {
        response.error(res, "user not already logged in.");
      }
    } catch (error) {
      console.log("error while getting invoices", error);
    }
  }

  async invoiceCreatePost(req, res) {
    try {
      const {
        clientId,
        taskId,
        paymentAmount,
        paymentDate,
        totalAmount,
        paymentDueDate,
      } = req.body;

      const token = await getToken(req, res);

      const adminUser = await prisma.user.findFirst({
        where: {
          token: parseInt(token),
        },
      });

      const client = await prisma.client.findFirst({
        where: {
          id: parseInt(clientId),
        },
      });
      const task = await prisma.task.findFirst({
        where: {
          id: parseInt(taskId),
        },
      });

      const newInvoice = await prisma.invoice.create({
        data: {
          clientName: client.clientName,
          taskName: task.task,
          taskId: task.id,
          clientId: client.id,
          totalAmount,
          paymentDueDate,
          addedBy: adminUser.id,
        },
      });

      if (paymentAmount && paymentDate) {
        await prisma.payment.create({
          data: {
            invoiceId: newInvoice.id,
            paymentAmount: paymentAmount,
            paymentDate: paymentDate,
            addedBy: adminUser.id,
          },
        });

        const invoiceBalanceUpdate = await prisma.invoice.update({
          where: {
            id: newInvoice.id,
          },
          data: {
            balance: totalAmount - paymentAmount,
          },
        });
        response.success(res, "new invoice created!", invoiceBalanceUpdate);
        return;
      }

      response.success(res, "new invoice created!", newInvoice);
    } catch (error) {
      console.log("error while creating invoice ->", error);
    }
  }

  async invoiceUpdatePatch(req, res) {
    try {
      const { totalAmount, balance, paymentDate, paymentDueDate } = req.body;
      const { invoiceId } = req.params;

      const token = await getToken(req, res);

      const adminUser = await prisma.user.findFirst({
        where: {
          token: parseInt(token),
        },
      });

      // finding campaign from id
      const invoiceFound = await prisma.invoice.findFirst({
        where: {
          id: parseInt(invoiceId),
        },
      });

      if (adminUser) {
        if (invoiceFound) {
          const updatedInvoice = await prisma.invoice.update({
            where: {
              id: parseInt(invoiceId),
            },
            data: {
              totalAmount,
              balance,
              paymentDate,
              paymentDueDate,
            },
          });

          response.success(res, "Invoice updated successfully", {
            updatedInvoice,
          });
        } else {
          response.error(res, "Invoice not found!");
        }
      } else {
        response.error(res, "User not found!");
      }
    } catch (error) {
      console.log("error while updating invoice ", error);
    }
  }
  async invoiceRemoveDelete(req, res) {
    try {
      const { invoiceId } = req.params;

      // finding campaign from campaignId
      const invoiceFound = await prisma.invoice.findFirst({
        where: {
          id: parseInt(invoiceId),
        },
      });

      if (invoiceFound) {
        const deletedInvoice = await prisma.invoice.delete({
          where: {
            id: parseInt(invoiceId),
          },
        });

        response.success(res, "Invoice deleted successfully!", {
          deletedInvoice,
        });
      } else {
        response.error(res, "invoice does not exist!");
      }
    } catch (error) {
      console.log("error while deleting invoice ", error);
    }
  }
}

module.exports = new InvoiceController();
