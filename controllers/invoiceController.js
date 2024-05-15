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
              campaigns: {
                select: {
                  id: true,
                  campaignName: true,
                  campaignDescription: true,
                  crmFields: true,
                  dispositions: true,
                },
              },
              leads: true,
              dropdowns: true,
              invoices: true,
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
      const { amount, balance, paymentDate, dueDate } = req.body;

      const token = await getToken(req, res);

      const adminUser = await prisma.user.findFirst({
        where: {
          token: parseInt(token),
        },
      });

      const newInvoice = await prisma.invoice.create({
        data: {
          amount,
          balance,
          paymentDate,
          dueDate,
          addedBy: adminUser.id,
        },
      });

      response.success(res, "new invoice created!", newInvoice);
    } catch (error) {
      console.log("error while creating invoice ->", error);
    }
  }

  async invoiceUpdatePatch(req, res) {
    try {
      const { amount, balance, paymentDate, dueDate } = req.body;
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
              amount,
              balance,
              paymentDate,
              dueDate,
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
