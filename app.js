const express = require("express");
const User = require("./models/userModel");
const Chat = require("./models/chatModel");
const app = express();
const http = require("http").createServer(app);

const path = require("path");
const dotenv = require("dotenv");
dotenv.config();
const mongoose = require("mongoose");

const PORT = process.env.PORT || 3000;
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/dynamic-chat-app";

if (!process.env.SESSION_SECRET) {
  if (process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET must be set in production");
  }

  process.env.SESSION_SECRET = "dev-session-secret";
  console.warn(
    "SESSION_SECRET is not set. Using a local development fallback.",
  );
}

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

const userRoute = require("./routes/userRoute");
const sessionMiddleware = require("./middleware/session");

// Tell Express to use EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(sessionMiddleware);
app.use("/", userRoute);
const io = require("socket.io")(http);

const userRoom = (userId) => `user:${userId}`;

var usp = io.of("/user-namespace");

usp.use((socket, next) => {
  if (!socket.request.res) {
    return next(new Error("Session response unavailable"));
  }

  sessionMiddleware(socket.request, socket.request.res, (err) => {
    if (err) {
      return next(err);
    }

    if (!socket.request.session || !socket.request.session.user_id) {
      return next(new Error("Unauthorized"));
    }

    return next();
  });
});

usp.on("connection", async (socket) => {
  console.log("User connected to user-namespace");
  var userId = socket.request.session && socket.request.session.user_id;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    socket.disconnect();
    return;
  }

  userId = String(userId);
  socket.join(userRoom(userId));
  socket.data = socket.data || {};
  socket.data.userId = userId;

  // console.log("User ID:", userId);
  await User.findByIdAndUpdate(userId, {
    isOnline: "1",
  });

  usp.emit("online-user", { userId: userId, isOnline: true });

  socket.on("new-chat", async (data) => {
    try {
      const sender = socket.data.userId;
      const receiver = data.receiver;
      const message =
        typeof data.message === "string" ? data.message.trim() : "";

      if (!mongoose.Types.ObjectId.isValid(receiver) || !message) {
        return;
      }

      const receiverExists = await User.exists({ _id: receiver });
      if (!receiverExists) {
        return;
      }

      const chat = new Chat({
        sender,
        receiver,
        message,
      });

      await chat.save();

      const payload = {
        sender,
        receiver,
        message,
        createdAt: chat.createdAt,
      };

      new Set([sender, receiver]).forEach((id) => {
        usp.to(userRoom(id)).emit("load-new-chat", payload);
      });
    } catch (err) {
      console.error(err);
    }
  });

  socket.on("disconnect", async () => {
    await User.findByIdAndUpdate(userId, {
      isOnline: "0",
    });
    console.log("User disconnected from user-namespace");
    // broadcast online status to all connected clients
    usp.emit("offline-user", { userId: userId, isOnline: false });
  });
});

http.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
