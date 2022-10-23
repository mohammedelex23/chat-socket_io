const express = require("express");
const router = express.Router();
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.use(express.static(__dirname + "/public/"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "index.html");
});

let users = [];

io.on("connection", (socket) => {
  console.log("a user connected", socket.id);
  socket.on("disconnect", () => {
    users = users.filter((user) => user.id != socket.id);
    socket.broadcast.emit("user disconnect", socket.id);
  });

  socket.on("message", async (user) => {
    socket.broadcast.emit("message", { ...user, id: socket.id });
  });

  socket.on("new user", (name) => {
    console.log("new user", name);
    console.log("user id", socket.id);

    users.push({ name, id: socket.id });
    // socket.broadcast.emit("new user", users);
    io.emit("new user", users);
  });

  socket.on("user disconnect", (user) => {
    console.log("user disconnected", user);
  });

  socket.on("user typing", function (name) {
    socket.broadcast.emit("user typing", { name, id: `${socket.id}typing` });
  });

  socket.on("user not typing", function (name) {
    socket.broadcast.emit("user not typing", {
      name,
      id: `${socket.id}typing`,
    });
  });
});

// app.use(router);

// routes
app.get("/chat", function (req, res, next) {
  // check for name in the query
  let query = req.query;
  if (
    !query["name"] ||
    (query.name && query.name == "") ||
    (query.name && !query.name.trim())
  ) {
    res.redirect("/");
  } else {
    res.sendFile(__dirname + "/public/chat.html");
  }
});

server.listen(5000, function () {
  console.log("Server is listening on port: 5000");
});
