const express = require("express");
require("dotenv").config();
const cors = require("cors");

const http = require("http");
const { Server } = require("socket.io");

const router = require("./src/routes");

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
  },
});

require("./src/socket")(io);
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

app.use("/api/v1/", router);
app.use("/uploads", express.static("uploads"));

app.get("/", function (req, res) {
  res.send({
    message: "Hello",
    CLIENT_URL: process.env.CLIENT_URL,
  });
});

// app.listen(port, () => console.log(`Listening on port 5000!`));
server.listen(port, () => console.log(`Listening on port 5000`));
