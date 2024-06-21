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

          const leadsWithEvents = await Promise.all(
            userLeads.map(async (lead) => {
              const leadEvents = await prisma.event.findMany({
                where: {
                  leadMobileNo: lead.mobileNo,
                  status: 1,
                },
              });

              const addedBy = await prisma.user.findFirst({
                where: {
                  id: parseInt(lead.addedBy),
                },
              });

              if (leadEvents.length === 0) {
                return { ...lead, addedBy };
              } else {
                return {
                  ...lead,
                  events: leadEvents,
                  addedBy,
                };
              }
            })
          );

          const dropdowns = await prisma.dropdown.findMany({});

          const { password, ...adminDataWithoutPassword } = loggedInUser;

          // if user is admin return all leads
          if (loggedInUser.roleId === 1) {
            const allLeads = await prisma.lead.findMany({
              where: {
                status: 1,
              },
            });

            const allLeadsWithEvents = await Promise.all(
              allLeads?.map(async (lead) => {
                const leadEvents = await prisma.event.findMany({
                  where: {
                    leadMobileNo: lead.mobileNo,
                    status: 1,
                  },
                });

                const addedBy = await prisma.user.findFirst({
                  where: {
                    id: parseInt(lead.addedBy),
                  },
                });

                if (leadEvents.length === 0) {
                  return { ...lead, addedBy };
                } else {
                  return {
                    ...lead,
                    events: leadEvents,
                    addedBy,
                  };
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
        address,
        description,
        task,
      } = req.body;

      console.log("CREATING LEAD BODY ->", req.body);

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
          address,
          description,
          task,
          status: 1,
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
        status,
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
          if (status === 0) {
            const updatedLead = await prisma.lead.update({
              where: {
                id: parseInt(leadId),
              },
              data: {
                status,
              },
            });

            const leadEvents = await prisma.event.findMany({
              where: {
                leadMobileNo: leadFound.mobileNo,
              },
            });

            if (leadEvents.length !== 0) {
              // delete all events
              await prisma.event.updateMany({
                where: {
                  leadMobileNo: leadFound.mobileNo,
                },
                data: {
                  status,
                },
              });
            }

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
                projectGenre,
                projectStatus,
                projectDueDate,
                youtubeLink,
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
