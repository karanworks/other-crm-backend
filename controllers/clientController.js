const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const response = require("../utils/response");
const getToken = require("../utils/getToken");
class ClientController {
  async clientsGet(req, res) {
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

        const userClients = await prisma.client.findMany({
          where: {
            addedBy: loggedInUser.id,
            status: 1,
          },
        });

        const userClientsWithAddedBy = await Promise.all(
          userClients.map(async (client) => {
            const addedByUser = await prisma.user.findFirst({
              where: {
                id: parseInt(client.addedBy),
              },
            });

            return {
              ...client,
              addedBy: {
                username: addedByUser.username,
                branch: addedByUser.branch,
              },
            };
          })
        );

        const dropdowns = await prisma.dropdown.findMany({});

        const { password, ...adminDataWithoutPassword } = loggedInUser;

        // if user is admin return all clients
        if (loggedInUser.roleId === 1) {
          const allClients = await prisma.client.findMany({
            where: {
              status: 1,
            },
          });

          const allClientsWithAddedBy = await Promise.all(
            allClients.map(async (client) => {
              const addedByUser = await prisma.user.findFirst({
                where: {
                  id: parseInt(client.addedBy),
                },
              });

              return {
                ...client,
                addedBy: {
                  username: addedByUser.username,
                  branch: addedByUser.branch,
                },
              };
            })
          );

          response.success(res, "Clients fetched", {
            ...adminDataWithoutPassword,
            dropdowns,
            clients: allClientsWithAddedBy,
          });
        } else {
          response.success(res, "Client fetched", {
            ...adminDataWithoutPassword,
            dropdowns,
            clients: userClientsWithAddedBy,
          });
        }
      } else {
        response.error(res, "user not already logged in.");
      }
    } catch (error) {
      console.log("error while getting clients", error);
    }
  }

  async clientCreatePost(req, res) {
    try {
      const {
        mobileNo,
        clientName,
        address,
        task,
        projectGenre,
        youtubeLink,
        projectDueDate,
        description,
        projectStatus,
      } = req.body;

      const token = await getToken(req, res);

      const adminUser = await prisma.user.findFirst({
        where: {
          token: parseInt(token),
        },
      });

      if (adminUser) {
        const newClient = await prisma.client.create({
          data: {
            clientName,
            mobileNo,
            address,
            status: 1,
            addedBy: adminUser.id,
          },
        });

        const newTask = await prisma.task.create({
          data: {
            task,
            projectGenre,
            projectStatus,
            projectDueDate,
            description,
            youtubeLink,
            addedBy: adminUser.id,
            clientId: newClient.id,
            clientName: newClient.clientName,
          },
        });

        response.success(res, "new client created!", newClient);
      } else {
        response.error(res, "User not logged in!");
      }
    } catch (error) {
      console.log("error while creating client ->", error);
    }
  }

  async clientUpdatePatch(req, res) {
    try {
      const { clientName, mobileNo, address, status } = req.body;
      const { clientId } = req.params;

      const token = await getToken(req, res);

      const adminUser = await prisma.user.findFirst({
        where: {
          token: parseInt(token),
        },
      });

      // finding campaign from id
      const clientFound = await prisma.client.findFirst({
        where: {
          id: parseInt(clientId),
        },
      });

      if (adminUser) {
        if (clientFound) {
          if (status === 0) {
            const updatedClient = await prisma.client.update({
              where: {
                id: parseInt(clientId),
              },
              data: {
                status,
              },
            });

            response.success(res, "Client deleted successfully", {
              updatedClient,
            });
          } else {
            const updatedClient = await prisma.client.update({
              where: {
                id: parseInt(clientId),
              },
              data: {
                clientName,
                mobileNo,
                address,
              },
            });

            const addedBy = await prisma.user.findFirst({
              where: {
                id: parseInt(updatedClient.addedBy),
              },
            });

            response.success(res, "Client updated successfully", {
              updatedClient: { ...updatedClient, addedBy },
            });
          }
        } else {
          response.error(res, "Client not found!");
        }
      } else {
        response.error(res, "User not found!");
      }
    } catch (error) {
      console.log("error while updating client ", error);
    }
  }
}

module.exports = new ClientController();
