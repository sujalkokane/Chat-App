const express = require("express");
const User = require("./models/userModel");
const Chat = require("./models/chatModel");
const app = express();
const http = require("http").createServer(app);

const path = require("path");
const dotenv = require("dotenv");
dotenv.config();
const mongoose = require("mongoose");

mongoose
  .connect("mongodb://127.0.0.1:27017/dynamic-chat-app")
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));
const userRoute = require("./routes/userRoute");

// Tell Express to use EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use("/", userRoute);
const io = require("socket.io")(http);

var usp = io.of("/user-namespace");
usp.on("connection", async (socket) => {
  console.log("User connected to user-namespace");
  var userId = socket.handshake.query.token;
  // console.log(socket.handshake.query);
  // console.log("User ID:", userId);
  await User.findByIdAndUpdate(socket.handshake.query.token, {
    isOnline: "1",
  });
  // broadcast online status to all connected clients
  usp.emit("online-user", { userId: userId, isOnline: true });

  socket.on("new-chat", async (data) => {
    try {
      const chat = new Chat({
        sender: data.sender,
        receiver: data.receiver,
        message: data.message,
      });

      await chat.save();

      usp.emit("load-new-chat", {
        sender: data.sender,
        receiver: data.receiver,
        message: data.message,
      });
    } catch (err) {
      console.error(err);
    }
  });

  socket.on("disconnect", async () => {
    await User.findByIdAndUpdate(socket.handshake.query.token, {
      isOnline: "0",
    });
    console.log("User disconnected from user-namespace");
    // broadcast online status to all connected clients
    usp.emit("offline-user", { userId: userId, isOnline: false });
  });
});

http.listen(3000, () => {
  console.log("Server running on port 3000");
});
