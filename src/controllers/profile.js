const { profile, user } = require("../../models");
const cloudinary = require("../utils/cloudinary");

exports.getProfile = async (req, res) => {
  try {
    const idUser = req.user.id;

    let data = await profile.findOne({
      where: {
        idUser,
      },
      attributes: {
        exclude: ["createdAt", "updatedAt", "idUser"],
      },
    });

    data = JSON.parse(JSON.stringify(data));

    data = {
      ...data,
      image: process.env.PATH_FILE + data.image,
    };

    res.send({
      status: "success...",
      data,
    });
  } catch (error) {
    console.log(error);
    res.send({
      status: "failed",
      message: "Server Error",
    });
  }
};

exports.updateProfile = async (req, res) => {
  // const { id } = req.params;
  const result = await cloudinary.uploader.upload(req.file.path, {
    folder: "waysbeans-uploads",
    use_filename: true,
    unique_filename: false,
  });

  try {
    const data = req.body;

    let updateProfile = await profile.update(
      {
        ...data,
        image: result.public_id,
      },
      { where: { id: req.user.id } }
    );

    console.log(req.user.id);
    updateProfile = JSON.parse(JSON.stringify(data));

    updateProfile = {
      ...updateProfile,
      image: process.env.PATH_FILE + result.public_id,
    };

    await user.update(req.body, {
      where: {
        id: req.user.id,
      },
    });

    res.status(200).send({
      status: "success",
      message: `update Product success`,
      data: {
        profile: updateProfile,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(404).send({
      status: "failed",
      message: "Server Error",
    });
  }
};
