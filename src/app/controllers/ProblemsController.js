import * as Yup from "yup";
import { Op } from "sequelize";
import User from "../models/User";
import Recipients from "../models/Recipients";
import Problems from "../models/Problems";
import Package from "../models/Package";
import File from "../models/File";
import Notification from "../schemas/Notification";
class ProblemController {
  async store(require, response) {
    const { title, description } = require.body;
    const package_id = require.query.package_id;

    const pack = await Package.findByPk(package_id);

    if (!pack) {
      return response.status(404).json({ error: "Package not found" });
    }

    const problem = Problems.findOne({ where: { package_id } });
    if (problem) {
      return response
        .status(401)
        .json({ error: "The package have already a problem recorded" });
    }
    const newProblem = await Problems.create({
      title,
      description,
      package_id,
    });

    return response.json({ newProblem });
  }

  async list(require, response) {
    const provider = await User.findOne({
      where: {
        id: require.userId,
        provider: true,
      },
    });
    if (!provider) {
      return response
        .status(401)
        .json({ error: "Only providers can list all the problems" });
    }

    const problems = await Problems.findAll({
      attributes: ["id", "title", "description"],
      include: [
        {
          model: Package,
          as: "packages",
          attributes: ["id", "product", "start_date"],
          include: [
            {
              model: Recipients,
              as: "recipients",
              attributes: [
                "id",
                "name",
                "cpf",
                "street",
                "number",
                "complement",
                "state",
                "city",
                "cep",
              ],
            },
            {
              model: User,
              as: "deliveryman",
              attributes: ["id", "name"],
              include: [{ model: File, as: "avatar" }],
            },
          ],
        },
      ],
    });

    return response.json({ problems });
  }
}
export default new ProblemController();
