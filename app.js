const express = require("express");
const app = express();

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

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
