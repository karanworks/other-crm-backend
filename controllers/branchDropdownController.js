const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const response = require("../utils/response");
const getToken = require("../utils/getToken");
class BranchDropdownController {
  async branchDropdownGet(req, res) {
    try {
      const branches = await prisma.branchDropdown.findMany({});

      response.success(res, "Branches fetched successfully!", branches);
    } catch (error) {
      console.log("Error while fetching branches", error);
    }
  }

  async branchDropdownCreatePost(req, res) {
    try {
      const { branchName } = req.body;

      const token = await getToken(req, res);

      const adminUser = await prisma.user.findFirst({
        where: {
          token: parseInt(token),
        },
      });

      const newBranchDropdown = await prisma.branchDropdown.create({
        data: {
          branchDropdownName: branchName,
          addedBy: adminUser.id,
        },
      });

      response.success(res, "new branch dropdown created!", newBranchDropdown);
    } catch (error) {
      console.log("error while creating branch dropdown ->", error);
    }
  }
}

module.exports = new BranchDropdownController();
