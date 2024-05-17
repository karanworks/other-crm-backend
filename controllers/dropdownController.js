const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const response = require("../utils/response");
const getToken = require("../utils/getToken");
class DropdownController {
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
