const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../config/keys");
const passport = require("passport");

const User = require("../models/User");

router.get("/test", (req, res) => {
  res.json({ msg: "users works" });
});

router.post("/login", (req, res) => {
  //check validation
  //there are errors isValid is false

  const email = req.body.email;
  const password = req.body.password;
  //find the user by email
  User.findOne({ email }).then(user => {
    //check for user
    if (!user) {
      return res.status(404).json("email not found");
    }
    //check password
    bcrypt.compare(password, user.password).then(isMatch => {
      if (isMatch) {
        //user matched
        const payload = {
          id: user.id,
          name: user.name
        }; //create jwt payload
        //sign token
        jwt.sign(
          payload,
          keys.secretOrKey,
          { expiresIn: 3600 },
          (err, token) => {
            res.json({
              success: true,
              token: token,
              id: user.id
            });
          }
        );
      } else {
        errors.password = "password incorrect";
        return res.status(400).json("password incorrect");
      }
    });
  });
});

router.post("/register", (req, res) => {
  User.findOne({ email: req.body.email }).then(user => {
    if (user) {
      return res.status(400).json("email already exists");
    } else {
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password
      });

      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser
            .save()
            .then(user => res.json(user))
            .catch(err => console.log(err));
        });
      });
    }
  });
});

module.exports = router;
