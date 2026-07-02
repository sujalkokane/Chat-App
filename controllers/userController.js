const User = require("../models/userModel");
const Chat = require("../models/chatModel");
const bcrypt = require("bcrypt");

const registerLoad = async (req, res) => {
  try {
    res.render("register");
  } catch (error) {
    console.log(error.message);
  }
};
const register = async (req, res) => {
  try {
    const passwordHash = await bcrypt.hash(req.body.password, 10);
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      image: "images/" + req.file.filename,
      password: passwordHash,
    });
    await user.save();
    return res.render("register", { message: "User Registered Successfully" });
    res.redirect("/");
  } catch (error) {
    console.log(error.message);
  }
};

const loadLogin = async (req, res) => {
  try {
    res.render("login");
  } catch (error) {
    console.log(error.message);
  }
};

const login = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const userData = await User.findOne({ email });

    if (!userData) {
      return res.render("login", {
        error: "Email or Password is incorrect",
      });
    }

    const passwordMatch = await bcrypt.compare(password, userData.password);

    if (!passwordMatch) {
      return res.render("login", {
        error: "Email or Password is incorrect",
      });
    }

    req.session.user_id = userData._id;
    return res.redirect("/dashboard");
  } catch (error) {
    console.log(error.message);
    return res.render("login", {
      error: "Something went wrong. Please try again.",
    });
  }
};
const loadDashboard = async (req, res) => {
  try {
    if (!req.session.user_id) {
      return res.redirect("/");
    }

    const userData = await User.findById(req.session.user_id);
    const users = await User.find({
      _id: { $ne: req.session.user_id },
    });
    return res.render("dashboard", {
      user: userData,
      users,
    });
  } catch (error) {
    console.log(error.message);
  }
};

const logout = async (req, res) => {
  try {
    const userId = req.session.user_id;

    if (userId) {
      await User.findByIdAndUpdate(userId, {
        isOnline: "0",
      });
    }

    req.session.destroy((err) => {
      if (err) {
        console.log(err.message);
        return res.redirect("/dashboard");
      }

      res.clearCookie("connect.sid");
      return res.redirect("/");
    });
  } catch (error) {
    console.log(error.message);
  }
};

const saveChat = async (req, res) => {
  try {
    var chat = new Chat({
      sender: req.body.sender,
      receiver: req.body.receiver,
      message: req.body.message,
    });

    await chat.save();
    res.status(200).send({ message: "Chat saved successfully" });
  } catch (err) {
    res.status(400).send({ message: "Error saving chat", error: err.message });
  }
};
const loadChat = async (req, res) => {
  try {
    const chats = await Chat.find({
      $or: [
        {
          sender: req.body.sender,
          receiver: req.body.receiver,
        },
        {
          sender: req.body.receiver,
          receiver: req.body.sender,
        },
      ],
    }).sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      chats,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to load chats",
    });
  }
};

module.exports = {
  loadRegister: registerLoad,
  registerUser: register,
  loadLogin: loadLogin,
  login: login,
  loadDashboard: loadDashboard,
  logout: logout,
  saveChat: saveChat,
  loadChat: loadChat,
};
