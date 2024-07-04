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
              status: 1,
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
              status: 1,
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
  async pendingTaskSearch(req, res) {
    try {
      const token = await getToken(req, res);

      const { searchQuery } = req.params;

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
              status: 1,
              OR: [
                { task: { contains: searchQuery } },
                { clientName: { contains: searchQuery } },
                { projectGenre: { contains: searchQuery } },
              ],
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
              status: 1,
              OR: [
                { task: { contains: searchQuery } },
                { clientName: { contains: searchQuery } },
                { projectGenre: { contains: searchQuery } },
              ],
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

  // async pendingTaskSearch(req, res) {
  //   try {
  //     const token = await getToken(req, res);

  //     console.log("SEARCH USER API CALLED");

  //     const { searchQuery } = req.params;

  //     if (token) {
  //       const { isActive } = await prisma.user.findFirst({
  //         where: {
  //           token: parseInt(token),
  //         },
  //       });

  //       if (isActive) {
  //         const loggedInUser = await prisma.user.findFirst({
  //           where: {
  //             token: parseInt(token),
  //           },
  //           select: {
  //             id: true,
  //             email: true,
  //             password: true,
  //             adminId: true,
  //             roleId: true,
  //           },
  //         });

  //         const users = await prisma.pending.findMany({
  //           where: {
  //             status: 1,
  //             OR: [
  //               { username: { contains: searchQuery } },
  //               { email: { contains: searchQuery } },
  //               { branch: { contains: searchQuery } },
  //             ],
  //           }
  //         });

  //         console.log("SEARCHED USERS ->", users);

  //         const { password, ...adminDataWithoutPassword } = loggedInUser;

  //         response.success(res, "Users fetched", {
  //           ...adminDataWithoutPassword,
  //           users,
  //         });
  //       } else {
  //         response.error(res, "User not active");
  //       }
  //     } else {
  //       response.error(res, "User not already logged in.");
  //     }
  //   } catch (error) {
  //     console.log("error while searching users", error);
  //   }
  // }
}

module.exports = new PendingTasksController();
