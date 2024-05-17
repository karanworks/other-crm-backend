const { PrismaClient } = require("@prisma/client");
const response = require("../utils/response");
const getLoggedInUser = require("../utils/getLoggedInUser");

const prisma = new PrismaClient();

class RoleController {
  async roleGet(req, res) {
    try {
      const roles = await prisma.role.findMany({});

      response.success(res, "roles feteched successfully!", roles);
    } catch (error) {
      console.log("error while getting roles ->", error);
    }
  }

  async roleCreatePost(req, res) {
    try {
      const { name, status } = req.body;

      const loggedInUser = await getLoggedInUser(req, res);

      if (loggedInUser) {
        const role = await prisma.role.create({ data: { name, status: 1 } });

        response.success(res, "role created successfully", role);
      } else {
        response.error(res, "no admin found");
      }
    } catch (error) {
      console.log("error while creating role ->", error);
    }
  }

  async roleUpdatePatch(req, res) {
    try {
      const { name } = req.body;
      const { roleId } = req.params;

      const loggedInUser = await getLoggedInUser(req, res);

      if (loggedInUser) {
        const roleToBeEdit = await prisma.role.findFirst({
          where: {
            id: parseInt(roleId),
          },
        });

        if (roleToBeEdit) {
          const updatedRole = await prisma.role.update({
            where: {
              id: roleToBeEdit.id,
            },
            data: {
              name,
            },
          });

          response.success(res, "role updated successfully", updatedRole);
        }
      } else {
        response.error(res, "admin not found");
      }
    } catch (error) {
      console.log("error while updating role name ->", error);
    }
  }

  async roleRemoveDelete(req, res) {
    try {
      const { roleId } = req.params;

      const loggedInUser = await getLoggedInUser(req, res);

      if (loggedInUser) {
        const deletedRole = await prisma.role.delete({
          where: {
            id: parseInt(roleId),
          },
        });

        response.success(res, "Role deleted succssfully", deletedRole);
      } else {
        response.error(res, "admin not found");
      }
    } catch (error) {
      console.log("error while deleting role ->", error);
    }
  }
}

module.exports = new RoleController();
