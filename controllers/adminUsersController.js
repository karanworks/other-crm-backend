const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const response = require("../utils/response");
const getToken = require("../utils/getToken");

class AdminUsers {
  async adminUsersGet(req, res) {
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

          const users = await prisma.user.findMany({
            where: {
              adminId: loggedInUser.id,
              status: 1,
            },
            select: {
              id: true,
              username: true,
              password: true,
              email: true,
              branch: true,
              roleId: true,
            },
          });

          const { password, ...adminDataWithoutPassword } = loggedInUser;

          response.success(res, "Users fetched", {
            ...adminDataWithoutPassword,
            users,
          });
        } else {
          response.error(res, "User not active");
        }
      } else {
        response.error(res, "User not already logged in.");
      }
    } catch (error) {
      console.log("error while getting users", error);
    }
  }
  async adminUsersSearch(req, res) {
    try {
      const token = await getToken(req, res);

      console.log("SEARCH USER API CALLED");

      const { searchQuery } = req.params;

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

          const users = await prisma.user.findMany({
            where: {
              adminId: loggedInUser.id,
              status: 1,
              OR: [
                { username: { contains: searchQuery } },
                { email: { contains: searchQuery } },
                { branch: { contains: searchQuery } },
              ],
            },
            select: {
              id: true,
              username: true,
              password: true,
              email: true,
              branch: true,
              roleId: true,
            },
          });

          console.log("SEARCHED USERS ->", users);

          const { password, ...adminDataWithoutPassword } = loggedInUser;

          response.success(res, "Users fetched", {
            ...adminDataWithoutPassword,
            users,
          });
        } else {
          response.error(res, "User not active");
        }
      } else {
        response.error(res, "User not already logged in.");
      }
    } catch (error) {
      console.log("error while searching users", error);
    }
  }
}

module.exports = new AdminUsers();
