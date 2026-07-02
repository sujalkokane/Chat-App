const isLogin = async (req, res, next) => {
  try {
    if (req.session.user_id) {
      return next();
    }

    return res.redirect("/");
  } catch (err) {
    console.log(err.message);
  }
};

const isLogout = async (req, res, next) => {
  try {
    if (req.session.user_id) {
      return res.redirect("/dashboard");
    }

    return next();
  } catch (err) {
    console.log(err.message);
  }
};

module.exports = {
  isLogin,
  isLogout,
};
