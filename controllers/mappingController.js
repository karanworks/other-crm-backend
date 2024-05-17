const { PrismaClient } = require("@prisma/client");
const response = require("../utils/response");
const getMenus = require("../utils/getMenus");
const getToken = require("../utils/getToken");

const prisma = new PrismaClient();

class MappingController {
  async getMapping(req, res) {
    try {
      const token = await getToken(req, res);

      if (token) {
        const loggedInUser = await prisma.user.findFirst({
          where: {
            token: parseInt(token),
          },
        });

        if (loggedInUser.isActive) {
          const menus = await getMenus(req, res);

          response.success(res, "Mapping data fetched successfully!", menus);
        } else {
          response.error(res, "User not active");
        }
      } else {
        response.error(res, "User not logged in!");
      }
    } catch (error) {
      console.log("error in get mapping", error);
    }
  }

  async changePermissionsPost(req, res) {
    try {
      const { menuId, subMenuId, roleId } = req.body;

      const permissionAlreadyExists = await prisma.subMenuAssign.findFirst({
        where: {
          roleId: parseInt(roleId),
          menuId,
          subMenuId,
        },
      });

      if (permissionAlreadyExists) {
        const deletedPermission = await prisma.subMenuAssign.delete({
          where: {
            id: parseInt(permissionAlreadyExists.id),
            menuId,
            subMenuId,
            roleId: parseInt(roleId),
          },
        });

        response.success(res, "route persmissions revoked successfully");
      } else {
        const udpatePermissions = await prisma.subMenuAssign.create({
          data: {
            menuId,
            subMenuId,
            roleId: parseInt(roleId),
            status: 1,
          },
        });

        response.success(res, "route persmissions given successfully");
      }
    } catch (error) {
      console.log("error while changing route permissions", error);
    }
  }
  async allowedPermissionsGet(req, res) {
    try {
      const { roleId } = req.params;

      const role = await prisma.role.findFirst({
        where: {
          id: parseInt(roleId),
        },
      });

      const subMenusAssign = await prisma.subMenuAssign.findMany({
        where: {
          roleId: role.id,
        },
      });

      const submenuIds = subMenusAssign.map((item) => item.subMenuId);

      const subMenu = await prisma.subMenu.findMany({
        where: {
          id: {
            in: submenuIds,
          },
        },
      });

      const uniqueSubMenuid = new Set(subMenu.map((item) => item.menuId));

      const menus = await prisma.menu.findMany({
        where: {
          id: {
            in: [...uniqueSubMenuid],
          },
        },
      });

      const menusWithSubMenuProperty = menus.map((menu) => {
        return { ...menu, subItems: [] };
      });

      menusWithSubMenuProperty.forEach((menu) => {
        // Filter submenus that have matching menuId
        const matchingSubMenus = subMenu.filter(
          (sub) => sub.menuId === menu.id
        );
        // Push matching submenus into the subMenus array of the menu
        menu.subItems.push(...matchingSubMenus);
      });

      response.success(
        res,
        "route persmissions fetched successfully",
        menusWithSubMenuProperty
      );
    } catch (error) {
      console.log("error while changing getting permissions", error);
    }
  }
}

module.exports = new MappingController();
