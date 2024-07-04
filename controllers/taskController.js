const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const response = require("../utils/response");
const getToken = require("../utils/getToken");
class TaskController {
  async tasksGet(req, res) {
    try {
      const token = await getToken(req, res);

      if (token) {
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

        const { password, ...adminDataWithoutPassword } = loggedInUser;

        // if user is admin return all leads
        if (loggedInUser.roleId === 1) {
          const allClientTasks = await prisma.task.findMany({
            where: {
              status: 1,
            },
          });

          const allClientTasksWithAddedBy = await Promise.all(
            allClientTasks.map(async (task) => {
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

          response.success(res, "Tasks fetched", {
            ...adminDataWithoutPassword,
            tasks: allClientTasksWithAddedBy,
          });
        } else {
          const clientTasks = await prisma.task.findMany({
            where: {
              addedBy: parseInt(loggedInUser.id),
              status: 1,
            },
          });

          const clientTasksWithAddedBy = await Promise.all(
            clientTasks.map(async (task) => {
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

          response.success(res, "Tasks fetched", {
            ...adminDataWithoutPassword,
            tasks: clientTasksWithAddedBy,
          });
        }
      } else {
        response.error(res, "user not already logged in.");
      }
    } catch (error) {
      console.log("error while getting leads", error);
    }
  }

  async taskCreatePost(req, res) {
    try {
      const {
        taskName,
        projectGenre,
        projectStatus,
        projectDueDate,
        youtubeLink,
        description,
        clientId,
        clientName,
      } = req.body;

      const token = await getToken(req, res);

      const adminUser = await prisma.user.findFirst({
        where: {
          token: parseInt(token),
        },
      });

      const [day, month, year] = projectDueDate.split("/").map(Number);

      // Set the date to noon to avoid timezone issues
      const date = new Date(year, month - 1, day, 12, 0, 0);

      // Get the date part of the ISO string (ignoring the time part)
      const isoDate = date.toISOString().split("T")[0];

      // Get current time in ISO format
      const currentTime = new Date().toISOString();

      // Combine date and current time (keeping the time part)
      const isoDateTime = `${isoDate}T${currentTime.split("T")[1]}`;
      const newTask = await prisma.task.create({
        data: {
          task: taskName,
          projectGenre,
          projectStatus,
          projectDueDate: isoDateTime,
          description,
          youtubeLink,
          addedBy: adminUser.id,
          clientId,
          clientName,
        },
      });

      response.success(res, "new task created!", newTask);
    } catch (error) {
      console.log("error while creating task ->", error);
    }
  }

  async taskUpdatePatch(req, res) {
    try {
      const {
        taskName,
        projectGenre,
        projectStatus,
        projectDueDate,
        youtubeLink,
        description,
        status,
      } = req.body;
      const { taskId } = req.params;

      const token = await getToken(req, res);

      const adminUser = await prisma.user.findFirst({
        where: {
          token: parseInt(token),
        },
      });

      const taskFound = await prisma.task.findFirst({
        where: {
          id: parseInt(taskId),
        },
      });

      if (adminUser) {
        if (taskFound) {
          if (status === 0) {
            const updatedTask = await prisma.task.update({
              where: {
                id: parseInt(taskId),
              },
              data: {
                status,
              },
            });

            const taskEvents = await prisma.event.findMany({
              where: {
                taskId: parseInt(taskId),
              },
            });

            if (taskEvents.length !== 0) {
              // delete all events
              await prisma.event.updateMany({
                where: {
                  taskId: parseInt(taskId),
                },
                data: {
                  status,
                },
              });
            }

            response.success(res, "Task deleted successfully", {
              updatedTask,
            });
          } else {
            const updatedTask = await prisma.task.update({
              where: {
                id: parseInt(taskId),
              },
              data: {
                task: taskName,
                projectGenre,
                projectStatus,
                projectDueDate,
                youtubeLink,
                description,
              },
            });

            const addedBy = await prisma.user.findFirst({
              where: {
                id: parseInt(updatedTask.addedBy),
              },
            });

            response.success(res, "Task updated successfully", {
              updatedTask: { ...updatedTask, addedBy },
            });
          }
        } else {
          response.error(res, "Task not found!");
        }
      } else {
        response.error(res, "User not found!");
      }
    } catch (error) {
      console.log("error while updating task ", error);
    }
  }

  async taskSearch(req, res) {
    try {
      const token = await getToken(req, res);

      const { searchQuery } = req.params;

      console.log("SEARCH QUERY FOR TASK ->", searchQuery);

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

          const tasks = await prisma.task.findMany({
            where: {
              status: 1,
              OR: [
                { task: { contains: searchQuery } },
                { clientName: { contains: searchQuery } },
                { projectGenre: { contains: searchQuery } },
              ],
            },
          });

          const { password, ...adminDataWithoutPassword } = loggedInUser;

          response.success(res, "Tasks Clients fetched", {
            ...adminDataWithoutPassword,
            tasks,
          });
        } else {
          response.error(res, "User not active");
        }
      } else {
        response.error(res, "User not already logged in.");
      }
    } catch (error) {
      console.log("error while searching tasks", error);
    }
  }
}

module.exports = new TaskController();
