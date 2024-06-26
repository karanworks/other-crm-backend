const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const response = require("../utils/response");
const getToken = require("../utils/getToken");
class PendingTasksController {
  async pendingTasksGet(req, res) {
    try {
      const token = await getToken(req, res);

      if (token) {
        const loggedInUser = await prisma.user.findFirst({
          where: {
            token: parseInt(token),
          },
        });

        const userClients = await prisma.client.findMany({
          where: {
            addedBy: loggedInUser.id,
            status: 1,
          },
        });

        const userClientIds = userClients?.map((client) => {
          return client.id;
        });

        const currentDate = new Date();

        const { password, ...adminDataWithoutPassword } = loggedInUser;

        // if user is admin return all clients
        if (loggedInUser.roleId === 1) {
          const allPendingTasks = await prisma.task.findMany({
            where: {
              projectDueDate: {
                lt: currentDate,
              },
              projectStatus: {
                not: "Completed",
              },
            },
          });

          const allPendingTasksWithAddedBy = await Promise.all(
            allPendingTasks.map(async (task) => {
              const addedByUser = await prisma.user.findFirst({
                where: {
                  id: parseInt(task.addedBy),
                },
              });

              return {
                ...task,
                addedBy: addedByUser,
              };
            })
          );

          response.success(res, "Pending tasks fetched", {
            ...adminDataWithoutPassword,
            pendingTasks: allPendingTasksWithAddedBy,
          });
        } else {
          const userPendingTasks = await prisma.task.findMany({
            where: {
              clientId: {
                in: userClientIds,
              },
              projectDueDate: {
                lt: currentDate,
              },
              projectStatus: {
                not: "Completed",
              },
            },
          });

          const userPendingTasksWithAddedBy = await Promise.all(
            userPendingTasks.map(async (task) => {
              const addedByUser = await prisma.user.findFirst({
                where: {
                  id: parseInt(task.addedBy),
                },
              });

              return {
                ...task,
                addedBy: addedByUser,
              };
            })
          );

          response.success(res, "Pending tasks fetched", {
            ...adminDataWithoutPassword,
            pendingTasks: userPendingTasksWithAddedBy,
          });
        }
      } else {
        response.error(res, "user not already logged in.");
      }
    } catch (error) {
      console.log("error while getting pending tasks", error);
    }
  }
}

module.exports = new PendingTasksController();
