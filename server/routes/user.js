const express = require("express");
const router = express.Router();

//auth
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/User");

router.post("/register", async (req, res) => {
  const user = req.body;

  const takenUsername = await User.findOne({ username: user.username });

  if (takenUsername) {
    res.status(400).json({ msg: `Username already exists` });
  } else {
    try {
      user.password = await bcrypt.hash(user.password, 10);
      const dbUser = new User({
        username: user.username.toLowerCase(),
        password: user.password,
      });
      dbUser.save();
      const payload = {
        id: dbUser._id,
        username: dbUser.username,
        admin: dbUser.admin,
      };
      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: 84600 },
        (err, token) => {
          if (err)
            return res
              .status(500)
              .json({ msg: `Error in processing this log in: ${err}` });
          return res.json({
            msg: "User added successfully",
            token: "Bearer " + token,
          });
        }
      );
    } catch (e) {
      if (e.code === 11000) {
        res.status(400).json({ msg: `Unable to add this User, ${e}` });
      }
    }
  }
});

router.post("/login", async (req, res) => {
  const userToLogIn = req.body;

  const foundUser = await User.findOne({ username: userToLogIn.username });

  if (foundUser) {
    const validPass = await bcrypt.compare(
      userToLogIn.password,
      foundUser.password
    );
    if (validPass) {
      const payload = {
        id: foundUser._id,
        username: foundUser.username,
        admin: foundUser.admin,
      };
      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: 84600 },
        (err, token) => {
          if (err)
            return res
              .status(500)
              .json({ msg: `Error in processing this log in: ${err}` });
          return res.json({
            msg: "Success",
            token: "Bearer " + token,
          });
        }
      );
    } else {
      return res.status(403).json({ msg: `Invalid Password` });
    }
  } else {
    return res.status(404).json({ msg: `User not found` });
  }
});

router.get("/isLoggedIn", async (req, res) => {
  const token = req.headers["x-access-token"]?.split(" ")[1];

  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if(err) return res.json({ msg: "Failed to authorize", isLoggedIn: false });
        req.user = {};
        req.user.id = decoded.id
        req.user.username = decoded.username
        return res.json({ msg: "authorized", isLoggedIn: true, admin: decoded.admin, username: decoded.username});
    });
  } else {
    res.json({ msg: "Incorrect token", isLoggedIn: false });
  }
});


module.exports = router;
