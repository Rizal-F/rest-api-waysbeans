const { user, profile } = require("../../models");

const Joi = require("joi");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  // code here
  const schema = Joi.object({
    name: Joi.string().min(5).required(),
    email: Joi.string().email().min(6).required(),
    password: Joi.string().min(6).required(),
  });

  const { error } = schema.validate(req.body);

  if (error)
    return res.status(400).send({
      message: error.details[0].message,
    });

  try {
    const userExist = await user.findOne({
      where: {
        email: req.body.email,
      },
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
    });
    if (userExist) {
      return res.status(400).send({
        status: "Failed",
        message: "Email already registered!",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const newUser = await user.create({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
      status: req.body.email == "admin@mail.com" ? "admin" : "customer",
    });

    await profile.create({
      idUser: newUser.id,
    });
    const token = jwt.sign({ id: user.id }, process.env.TOKEN_KEY);

    res.send({
      status: "success",
      message: "Register Successful",
      data: {
        user: {
          name: newUser.name,
          email: newUser.email,
          token,
        },
      },
    });
  } catch (error) {
    console.log(error);
    res.send({
      status: "failed",
      message: "Server error",
    });
  }
};

exports.login = async (req, res) => {
  const schema = Joi.object({
    email: Joi.string().email().min(6).required(),
    password: Joi.string().min(6).required(),
  });

  const { error } = schema.validate(req.body);

  if (error)
    return res.status(400).send({
      message: error.details[0].message,
    });

  try {
    const userExist = await user.findOne({
      where: {
        email: req.body.email,
      },
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
    });

    if (!userExist) {
      return res.status(404).send({
        status: "Failed",
        message: "User not Found! Please Register",
      });
    }

    const isValid = await bcrypt.compare(req.body.password, userExist.password);
    if (!isValid) {
      return res.status(400).send({
        status: "failed",
        message: "Password is not match",
      });
    }

    const dataToken = {
      id: userExist.id,
      status: userExist.status,
    };

    const SECRRET_KEY = process.env.TOKEN_KEY;
    const token = jwt.sign(dataToken, SECRRET_KEY);

    res.status(200).send({
      status: "success...",
      data: {
        user: {
          id: userExist.id,
          name: userExist.name,
          email: userExist.email,
          status: userExist.status,
          token,
        },
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      status: "failed",
      message: "Server Error",
    });
  }
};

exports.checkAuth = async (req, res) => {
  try {
    const id = req.user.id;

    const dataUser = await user.findOne({
      where: {
        id,
      },
      attributes: {
        exclude: ["createdAt", "updatedAt", "password"],
      },
    });

    if (!dataUser) {
      return res.status(404).send({
        status: "failed",
      });
    }

    res.send({
      status: "success...",
      data: {
        user: {
          id: dataUser.id,
          name: dataUser.name,
          email: dataUser.email,
          status: dataUser.status,
        },
      },
    });
  } catch (error) {
    console.log(error);
    res.status({
      status: "failed",
      message: "Server Error",
    });
  }
};

// npx sequelize-cli model:generate --name user --attributes email:string,name:string,password:string,status:string
// npx sequelize-cli model:generate --name profile --attributes image:string,address:text,postcode:integer,phone:integer,idUser:integer
// npx sequelize-cli model:generate --name product --attributes name:string,desc:text,price:integer,image:string,qty:integer,idUser:integer
// npx sequelize-cli model:generate --name transaction --attributes idBuyer:integer,idProductTransaction:integer,price:integer,qty:integer,status:string
// npx sequelize-cli model:generate --name producttransaction --attributes idBuyer:integer,idProduct:integer,idTransaction:integer,qty:integer
// npx sequelize-cli model:generate --name cart --attributes idBuyer:integer,idProduct:integer,qty:integer
// npx sequelize-cli model:generate --name chat --attributes message:text,idSender:integer,idRecipient:integer
