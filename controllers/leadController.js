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
              leads: true,
              dropdowns: true,
            },
          });

          const { password, ...adminDataWithoutPassword } = loggedInUser;

          response.success(res, "Leads fetched", {
            ...adminDataWithoutPassword,
          });
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
        projectGenre,
        projectStatus,
        projectDueDate,
        youtubeLink,
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
          projectGenre,
          projectStatus,
          projectDueDate,
          youtubeLink,
          addedBy: adminUser.id,
        },
      });

      response.success(res, "new lead created!", newLead);
    } catch (error) {
      console.log("error while creating lead ->", error);
    }
  }

  async leadUpdatePatch(req, res) {
    try {
      const {
        clientName,
        projectGenre,
        projectStatus,
        youtubeLink,
        projectDueDate,
      } = req.body;
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
          const updatedLead = await prisma.lead.update({
            where: {
              id: parseInt(leadId),
            },
            data: {
              clientName,
              projectGenre,
              projectStatus,
              projectDueDate,
              youtubeLink,
            },
          });

          response.success(res, "Lead updated successfully", {
            updatedLead,
          });
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
  async leadRemoveDelete(req, res) {
    try {
      const { leadId } = req.params;

      // finding campaign from campaignId
      const leadFound = await prisma.lead.findFirst({
        where: {
          id: parseInt(leadId),
        },
      });

      if (leadFound) {
        const deletedLead = await prisma.lead.delete({
          where: {
            id: parseInt(leadId),
          },
        });

        response.success(res, "Lead deleted successfully!", {
          deletedLead,
        });
      } else {
        response.error(res, "Lead does not exist!");
      }
    } catch (error) {
      console.log("error while deleting lead ", error);
    }
  }
}

module.exports = new LeadController();
