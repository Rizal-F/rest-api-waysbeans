const { user, cart, product } = require("../../models");

exports.addCart = async (req, res) => {
  try {
    data = {
      idProduct: parseInt(req.body.idProduct),
      idBuyer: req.user.id,
      qty: 1,
    };

    const productExist = await cart.findOne({
      where: {
        idProduct: parseInt(req.body.idProduct),
        idBuyer: req.user.id,
      },
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
    });

    if (productExist) {
      const addQty = {
        qty: productExist.qty + 1,
      };

      await cart.update(addQty, {
        where: {
          id: productExist.id,
        },
      });
    } else {
      await cart.create(data);
    }

    res.send({
      status: "success",
      message: "Add cart finished",
    });
  } catch (error) {
    console.log(error);
    res.send({
      status: "failed",
      message: "Server Error",
    });
  }
};

exports.getCarts = async (req, res) => {
  try {
    const idBuyer = req.user.id;

    let data = await cart.findAll({
      where: {
        idBuyer,
      },
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
      include: [
        {
          model: product,
          as: "product",
          attributes: {
            exclude: ["createdAt", "updatedAt", "password", "status"],
          },
        },
      ],
    });
    data = JSON.parse(JSON.stringify(data));
    data = data.map((item) => {
      return {
        ...item,
        product: {
          name: item.product.name,
          image: process.env.PATH_FILE + item.product.image,
          price: item.product.price,
        },
      };
    });
    res.send({
      status: "success",
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
exports.getCart = async (req, res) => {
  try {
    const { id } = req.params;

    let data = await cart.findAll({
      where: {
        idBuyer: id,
      },
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
      include: [
        {
          model: product,
          as: "product",
          attributes: {
            exclude: ["createdAt", "updatedAt", "password", "status"],
          },
        },
      ],
    });
    data = JSON.parse(JSON.stringify(data));
    data = data.map((item) => {
      return {
        ...item,
        product: {
          name: item.product.name,
          image: process.env.PATH_FILE + item.product.image,
          price: item.product.price,
        },
      };
    });
    res.send({
      status: "success",
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

exports.updateCart = async (req, res) => {
  try {
    const { id } = req.params;

    const newCart = await cart.update(req.body, {
      where: {
        id,
      },
    });
    let data = await cart.findOne({
      where: {
        id,
      },
      attributes: {
        exclude: ["createdAt", "updatedAt", "idUser"],
      },
      include: [
        {
          model: product,
          as: "product",
          attributes: {
            exclude: ["createdAt", "updatedAt", "password", "status"],
          },
        },
      ],
    });
    res.send({
      status: "success...",
      data,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      status: "failed",
      message: "Server Error",
    });
  }
};
exports.deleteCart = async (req, res) => {
  try {
    const { id } = req.params;

    await cart.destroy({
      where: {
        id,
      },
    });

    res.send({
      status: "success",
      message: `Delete Cart finished`,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      status: "failed",
      message: "Server Error",
    });
  }
};
