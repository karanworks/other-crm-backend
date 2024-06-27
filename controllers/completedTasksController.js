const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const response = require("../utils/response");
const getToken = require("../utils/getToken");

class CompletedTasksController {
  async completedTasksGet(req, res) {
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

        const { password, ...adminDataWithoutPassword } = loggedInUser;

        // if user is admin return all clients
        if (loggedInUser.roleId === 1) {
          const allCompletedTasks = await prisma.task.findMany({
            where: {
              projectStatus: "Completed",
              status: 1,
            },
          });

          const allCompletedTasksWithAddedBy = await Promise.all(
            allCompletedTasks.map(async (task) => {
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

          response.success(res, "Completed tasks fetched", {
            ...adminDataWithoutPassword,
            completedTasks: allCompletedTasksWithAddedBy,
          });
        } else {
          const userCompletedTasks = await prisma.task.findMany({
            where: {
              clientId: {
                in: userClientIds,
              },

              projectStatus: "Completed",
              status: 1,
            },
          });

          const userCompletedTasksWithAddedBy = await Promise.all(
            userCompletedTasks.map(async (task) => {
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

          response.success(res, "Completed tasks fetched", {
            ...adminDataWithoutPassword,
            completedTasks: userCompletedTasksWithAddedBy,
          });
        }
      } else {
        response.error(res, "user not already logged in.");
      }
    } catch (error) {
      console.log("error while getting completed tasks", error);
    }
  }
}

module.exports = new CompletedTasksController();
