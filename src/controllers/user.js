//import model
const { user, profile } = require("../../models");

// controller for table user
exports.addUser = async (req, res) => {
  try {
    await user.create(req.body);

    res.send({
      status: "success",
      messeage: "add user has done",
    });
  } catch (error) {
    console.log(error);
    res.send({
      status: "failed",
      messeage: "Server Error",
    });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await user.findAll({
      include: {
        model: profile,
        as: "profile",
        attributes: {
          exclude: ["createdAt", "updatedAt", "idUser"],
        },
      },
      attributes: {
        exclude: ["password", "createdAt", "updatedAt"],
      },
    });

    res.send({
      status: "success",
      data: {
        users,
      },
    });
  } catch (error) {
    console.log(error);
    res.send({
      status: "failed",
      message: "Server Error",
    });
  }
};

exports.getUser = async (req, res) => {
  try {
    const { id } = req.params;

    let data = await user.findOne({
      where: {
        id,
      },

      include: {
        model: profile,
        as: "profile",
        attributes: {
          exclude: ["createdAt", "updatedAt", "idUser"],
        },
      },
      attributes: {
        exclude: ["password", "createdAt", "updatedAt"],
      },
    });
    data = JSON.parse(JSON.stringify(data));

    data = {
      ...data,
      image: process.env.PATH_FILE + data.profile.image,
      postcode: data.profile.postcode,
      phone: data.profile.phone,
      gender: data.profile.gender,
      address: data.profile.address,
    };

    res.send({
      status: "success",
      data: {
        users: data,
      },
    });
  } catch (error) {
    console.log(error);
    res.send({
      status: "failed",
      message: "Server Error",
    });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    await user.update(req.body, {
      where: {
        id,
      },
    });

    const dataProfile = await profile.update(req.body, {
      where: {
        idUser: id,
      },
    });

    res.send({
      status: "success",
      message: `Update user id: ${id} finished`,
      data: req.body,
    });
  } catch (error) {
    console.log(error);
    res.send({
      status: "failed",
      message: "Server Error",
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    await user.destroy({
      where: {
        id,
      },
    });

    res.send({
      status: "success",
      message: `Delete user id: ${id} finished`,
    });
  } catch (error) {
    console.log(error);
    res.send({
      status: "failed",
      message: "Server Error",
    });
  }
};
