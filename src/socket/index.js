// import models here
const { chat, profile, user } = require("../../models");

// import token and Op(option)
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");

//variable user yang connect
const connectedUser = {};

// on = penerima informasi/event
// emit = pengirim informasi

const socketIo = (io) => {
  // create middlewares before connection event || middleware to get auth token
  // to prevent client access socket server without token
  io.use((socket, next) => {
    if (socket.handshake.auth && socket.handshake.auth.token) {
      next();
    } else {
      next(new Error("Not Authorized"));
    }
  });

  io.on("connection", (socket) => {
    console.log("client connect: ", socket.id);

    //get variable connected user
    const userId = socket.handshake.query.id;
    connectedUser[userId] = socket.id;

    // load admin contact
    socket.on("load admin contact", async () => {
      try {
        const adminContact = await user.findOne({
          where: {
            status: "admin",
          },
          include: [
            {
              model: profile,
              as: "profile",
              attributes: {
                exclude: ["createdAt", "updatedAt", "idUser"],
              },
            },
          ],
          attributes: {
            exclude: ["createdAt", "updatedAt", "password"],
          },
        });

        socket.emit("admin contact", adminContact);
      } catch (error) {
        console.log(error);
      }
    });

    // load customer contact
    socket.on("load customer contacts", async () => {
      try {
        let customerContacts = await user.findAll({
          include: [
            {
              model: profile,
              as: "profile",
              attributes: {
                exclude: ["createdAt", "updatedAt", "idUser"],
              },
            },
            {
              model: chat,
              as: "senderMessage",
              attributes: {
                exclude: ["createdAt", "updatedAt", "idRecipient", "idSender"],
              },
            },
            {
              model: chat,
              as: "recipientMessage",
              attributes: {
                exclude: ["createdAt", "updatedAt", "idRecipient", "idSender"],
              },
            },
          ],
          attributes: {
            exclude: ["createdAt", "updatedAt", "password"],
          },
          where: {
            status: "customer",
          },
        });

        customerContacts = JSON.parse(JSON.stringify(customerContacts));
        customerContacts = customerContacts.map((item) => ({
          ...item,
          image: item.image
            ? "http://localhost:5000/uploads/" + item.image
            : null,
        }));

        socket.emit("customer contacts", customerContacts);
      } catch (error) {
        console.log(error);
      }
    });

    //function load messeges
    socket.on("load messages", async (payload) => {
      try {
        const token = socket.handshake.auth.token;

        const tokenKey = process.env.TOKEN_KEY;
        const verified = jwt.verify(token, tokenKey);

        const idRecipient = payload; // menangkap data id dari client
        const idSender = verified.id;

        const data = await chat.findAll({
          where: {
            idSender: {
              [Op.or]: [idRecipient, idSender],
            },
            idRecipient: {
              [Op.or]: [idRecipient, idSender],
            },
          },
          include: [
            {
              model: user,
              as: "recipient",
              attributes: {
                exclude: ["createdAt", "updatedAt", "password"],
              },
            },
            {
              model: user,
              as: "sender",
              attributes: {
                exclude: ["createdAt", "updatedAt", "password"],
              },
            },
          ],
          order: [["createdAt", "ASC"]],
          attributes: {
            exclude: ["createdAt", "updatedAt", "idRecipient", "idSender"],
          },
        });
        socket.emit("messages", data);
      } catch (error) {
        console.log(error);
      }
    });

    //function send messege
    socket.on("send message", async (payload) => {
      try {
        const token = socket.handshake.auth.token;

        const tokenKey = process.env.TOKEN_KEY;
        const verified = jwt.verify(token, tokenKey);

        const idSender = verified.id;

        const { message, idRecipient } = payload;

        await chat.create({
          message,
          idRecipient,
          idSender,
        });

        io.to(socket.id)
          .to(connectedUser[idRecipient])
          .emit("new message", idRecipient);
      } catch (error) {
        console.log(error);
      }
    });

    socket.on("disconnect", () => {
      console.log("client disconnect");
    });
  });
};

module.exports = socketIo;
