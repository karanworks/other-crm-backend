const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const response = require("../utils/response");
const getToken = require("../utils/getToken");
class LeadController {
  async leadsGet(req, res) {
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
            },
          });

          const userLeads = await prisma.lead.findMany({
            where: {
              addedBy: loggedInUser.id,
              status: 1,
            },
          });

          const dropdowns = await prisma.dropdown.findMany({});

          const { password, ...adminDataWithoutPassword } = loggedInUser;

          // if user is admin return all leads
          if (loggedInUser.roleId === 1) {
            const allLeads = await prisma.lead.findMany({
              where: {
                status: 1,
              },
            });

            response.success(res, "Leads fetched", {
              ...adminDataWithoutPassword,
              dropdowns,
              leads: allLeads,
            });
          } else {
            response.success(res, "Leads fetched", {
              ...adminDataWithoutPassword,
              dropdowns,
              leads: userLeads,
            });
          }
        } else {
          response.error(res, "User not active!");
        }
      } else {
        response.error(res, "user not already logged in.");
      }
    } catch (error) {
      console.log("error while getting leads", error);
    }
  }

  async leadCreatePost(req, res) {
    try {
      const {
        clientName,
        mobileNo,
        projectGenre,
        projectStatus,
        projectDueDate,
        youtubeLink,
        address,
        description,
        task,
      } = req.body;

      const token = await getToken(req, res);

      const adminUser = await prisma.user.findFirst({
        where: {
          token: parseInt(token),
        },
      });

      const newLead = await prisma.lead.create({
        data: {
          clientName,
          mobileNo,
          address,
          status: 1,
          addedBy: adminUser.id,
        },
      });

      const newTask = await prisma.task.create({
        task,
        projectGenre,
        projectStatus,
        projectDueDate,
        description,
        youtubeLink,
        addedBy: adminUser.id,
        clientId: newLead.id,
        clientName: newLead.clientName,
      });

      response.success(res, "new lead created!", newLead);
    } catch (error) {
      console.log("error while creating lead ->", error);
    }
  }

  async leadUpdatePatch(req, res) {
    try {
      const { clientName, mobileNo, address, status } = req.body;
      const { leadId } = req.params;

      const token = await getToken(req, res);

      const adminUser = await prisma.user.findFirst({
        where: {
          token: parseInt(token),
        },
      });

      // finding campaign from id
      const leadFound = await prisma.lead.findFirst({
        where: {
          id: parseInt(leadId),
        },
      });

      if (adminUser) {
        if (leadFound) {
          if (status === 0) {
            const updatedLead = await prisma.lead.update({
              where: {
                id: parseInt(leadId),
              },
              data: {
                status,
              },
            });

            response.success(res, "Lead deleted successfully", {
              updatedLead,
            });
          } else {
            const updatedLead = await prisma.lead.update({
              where: {
                id: parseInt(leadId),
              },
              data: {
                clientName,
                mobileNo,
                address,
              },
            });

            const addedBy = await prisma.user.findFirst({
              where: {
                id: parseInt(updatedLead.addedBy),
              },
            });

            response.success(res, "Lead updated successfully", {
              updatedLead: { ...updatedLead, addedBy },
            });
          }
        } else {
          response.error(res, "Lead not found!");
        }
      } else {
        response.error(res, "User not found!");
      }
    } catch (error) {
      console.log("error while updating lead ", error);
    }
  }
}

module.exports = new LeadController();
