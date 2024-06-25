const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const response = require("../utils/response");
const getToken = require("../utils/getToken");

class EventController {
  async eventsGet(req, res) {
    try {
      const { mobileNo } = req.params;
      const token = await getToken(req, res);

      if (token) {
        const { isActive } = await prisma.user.findFirst({
          where: {
            token: parseInt(token),
          },
        });

        const allEvents = await prisma.event.findMany({
          where: {
            status: 1,
          },
        });

        const leadEvents = await prisma.event.findMany({
          where: {
            mobileNo,
            status: 1,
          },
        });

        if (isActive) {
          response.success(res, "Events fetched", {
            leadEvents,
            allEvents,
          });
        } else {
          response.error(res, "User not active!");
        }
      } else {
        response.error(res, "user not already logged in.");
      }
    } catch (error) {
      console.log("error while getting events", error);
    }
  }

  async eventCreatePost(req, res) {
    try {
      const { events } = req.body;

      const token = await getToken(req, res);

      const adminUser = await prisma.user.findFirst({
        where: {
          token: parseInt(token),
        },
      });

      if (Array.isArray(events)) {
        const newEvents = [];

        for (const event of events) {
          const newEvent = await prisma.event.create({
            data: {
              eventName: event.eventName,
              eventDate: event.eventDate,
              clientName: event.clientName,
              leadMobileNo: event.leadMobileNo,
              status: 1,
              addedBy: adminUser.id,
            },
          });

          newEvents.push(newEvent);
        }

        response.success(res, "new event created!", newEvents);
      } else {
        const newEvent = await prisma.event.create({
          data: {
            eventName: events.eventName,
            eventDate: events.eventDate,
            clientName: events.clientName,
            leadMobileNo: events.leadMobileNo,
            status: 1,
            addedBy: adminUser.id,
          },
        });

        response.success(res, "new event created!", newEvent);
      }
    } catch (error) {
      console.log("error while creating event ->", error);
    }
  }

  async eventUpdatePatch(req, res) {
    try {
      const { eventName, eventDate, status } = req.body;
      const { eventId } = req.params;

      const token = await getToken(req, res);

      const adminUser = await prisma.user.findFirst({
        where: {
          token: parseInt(token),
        },
      });

      const eventFound = await prisma.event.findFirst({
        where: {
          id: parseInt(eventId),
        },
      });

      if (adminUser) {
        if (eventFound) {
          if (status === 0) {
            const updatedEvent = await prisma.event.update({
              where: {
                id: parseInt(eventId),
              },
              data: {
                status,
              },
            });

            response.success(res, "Event deleted successfully", {
              updatedEvent,
            });
          } else {
            const updatedEvent = await prisma.event.update({
              where: {
                id: parseInt(eventId),
              },
              data: {
                eventName,
                eventDate,
              },
            });

            response.success(res, "Event updated successfully", {
              updatedEvent,
            });
          }
        } else {
          response.error(res, "Event not found!");
        }
      } else {
        response.error(res, "User not found!");
      }
    } catch (error) {
      console.log("error while updating event ", error);
    }
  }
  // async eventRemoveDelete(req, res) {
  //   try {
  //     const { eventId } = req.params;

  //     const eventFound = await prisma.event.findFirst({
  //       where: {
  //         id: parseInt(eventId),
  //       },
  //     });

  //     if (eventFound) {
  //       const deletedEvent = await prisma.event.delete({
  //         where: {
  //           id: parseInt(eventId),
  //         },
  //       });

  //       response.success(res, "Event deleted successfully!", {
  //         deletedEvent,
  //       });
  //     } else {
  //       response.error(res, "Event does not exist!");
  //     }
  //   } catch (error) {
  //     console.log("error while deleting event ", error);
  //   }
  // }
}

module.exports = new EventController();
