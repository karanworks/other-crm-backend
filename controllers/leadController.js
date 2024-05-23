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
              // leads: true,
              // leads: {
              //   include: {
              //     events: true,
              //   },
              // },
            },
          });

          const userLeads = await prisma.lead.findMany({
            where: {
              addedBy: loggedInUser.id,
            },
          });

          const leadsWithEvents = await Promise.all(
            userLeads.map(async (lead) => {
              const leadEvents = await prisma.event.findMany({
                where: {
                  leadMobileNo: lead.mobileNo,
                },
              });

              if (leadEvents.length === 0) {
                return lead;
              } else {
                return { ...lead, events: leadEvents };
              }
            })
          );

          const dropdowns = await prisma.dropdown.findMany({});

          const { password, ...adminDataWithoutPassword } = loggedInUser;

          // if user is admin return all leads
          if (loggedInUser.roleId === 1) {
            const allLeads = await prisma.lead.findMany({});

            const allLeadsWithEvents = await Promise.all(
              allLeads?.map(async (lead) => {
                const leadEvents = await prisma.event.findMany({
                  where: {
                    leadMobileNo: lead.mobileNo,
                  },
                });

                if (leadEvents.length === 0) {
                  return lead;
                } else {
                  return { ...lead, events: leadEvents };
                }
              })
            );

            response.success(res, "Leads fetched", {
              ...adminDataWithoutPassword,
              dropdowns,
              leads: allLeadsWithEvents,
            });
          } else {
            response.success(res, "Leads fetched", {
              ...adminDataWithoutPassword,
              dropdowns,
              leads: leadsWithEvents,
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
        mobileNo,
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
              mobileNo,
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

      const leadEvents = await prisma.event.findMany({
        where: {
          leadMobileNo: leadFound.mobileNo,
        },
      });

      if (leadFound) {
        const deletedLead = await prisma.lead.delete({
          where: {
            id: parseInt(leadId),
          },
        });

        if (leadEvents.length !== 0) {
          // delete all events
          await prisma.event.deleteMany({
            where: {
              leadMobileNo: leadFound.mobileNo,
            },
          });
        }

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
