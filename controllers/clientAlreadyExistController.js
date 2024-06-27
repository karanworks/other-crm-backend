const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const response = require("../utils/response");
const getToken = require("../utils/getToken");
class ClientAlreadyExistController {
  async clientAlreadyExistPost(req, res) {
    try {
      const token = await getToken(req, res);

      if (token) {
        const { mobileNo } = req.body;

        const clientAlreadyExist = await prisma.client.findFirst({
          where: {
            mobileNo,
          },
        });

        if (clientAlreadyExist) {
          response.error(res, "Mobile no is already registered!");
        } else {
          response.success(res, "Mobile no not registered!");
        }
      } else {
        response.error(res, "user not already logged in.");
      }
    } catch (error) {
      console.log("error while checking if client already exist", error);
    }
  }
}

module.exports = new ClientAlreadyExistController();
