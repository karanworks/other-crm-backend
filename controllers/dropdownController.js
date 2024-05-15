const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const response = require("../utils/response");
const getToken = require("../utils/getToken");
class DropdownController {
  //   async dropdownsGet(req, res) {
  //     try {
  //       const token = await getToken(req, res);

  //       if (token) {
  //         const { isActive } = await prisma.user.findFirst({
  //           where: {
  //             token: parseInt(token),
  //           },
  //         });

  //         if (isActive) {
  //           const loggedInUser = await prisma.user.findFirst({
  //             where: {
  //               token: parseInt(token),
  //             },
  //             select: {
  //               id: true,
  //               email: true,
  //               password: true,
  //               adminId: true,
  //               campaigns: {
  //                 select: {
  //                   id: true,
  //                   campaignName: true,
  //                   campaignDescription: true,
  //                   crmFields: true,
  //                   dispositions: true,
  //                 },
  //               },
  //               leads: true,
  //             },
  //           });

  //           const { password, ...adminDataWithoutPassword } = loggedInUser;

  //           response.success(res, "Leads fetched", {
  //             ...adminDataWithoutPassword,
  //           });
  //         } else {
  //           response.error(res, "User not active!");
  //         }
  //       } else {
  //         response.error(res, "user not already logged in.");
  //       }
  //     } catch (error) {
  //       console.log("error while getting leads", error);
  //     }
  //   }

  async dropdownCreatePost(req, res) {
    try {
      const { category, dropdownName } = req.body;

      const token = await getToken(req, res);

      const adminUser = await prisma.user.findFirst({
        where: {
          token: parseInt(token),
        },
      });

      const newDropdown = await prisma.dropdown.create({
        data: {
          category,
          dropdownName,
          addedBy: adminUser.id,
        },
      });

      response.success(res, "new dropdown created!", newDropdown);
    } catch (error) {
      console.log("error while creating dropdown ->", error);
    }
  }
}

module.exports = new DropdownController();
