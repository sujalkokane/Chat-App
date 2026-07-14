const express = require("express");

const user_route = express.Router();

const body_parser = require("body-parser");

user_route.use(body_parser.json());
user_route.use(body_parser.urlencoded({ extended: true }));

user_route.use(express.static("public"));

const path = require("path");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../public/images"));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

const userController = require("../controllers/userController");

const auth = require("../middleware/auth");

user_route.get("/register", auth.isLogout, userController.loadRegister);
user_route.post(
  "/register",
  upload.single("image"),
  userController.registerUser,
);

user_route.get("/", auth.isLogout, userController.loadLogin);
user_route.post("/", userController.login);
user_route.get("/logout", auth.isLogin, userController.logout);
user_route.get("/dashboard", auth.isLogin, userController.loadDashboard);
user_route.post("/save-chat", auth.isLogin, userController.saveChat);
user_route.post("/load-chat", auth.isLogin, userController.loadChat);
user_route.use((req, res) => {
  res.status(404).redirect("/");
});
module.exports = user_route;
