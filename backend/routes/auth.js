const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
var fetchuser = require("../middleware/fetchuser");

const JWT_SECRET = "Thisisame";

// Route 1: Create a user using : POST "/api/auth/createuser" No login reqired
router.post(
  "/createuser",
  [
    body("name", "Enter a valid name").isLength({ min: 3 }),
    body("email", "Enter a valid email").isEmail(),
    body("password", "Password must be at least 5 characters").isLength({
      min: 5,
    }),
  ],

  async (req, res) => {
    let success = false;
    //Validates data and return errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.send({ success,errors: errors.array() });
    }
    try {
      //Check whether the user with same email already exist or not
      let user = await User.findOne({ email: req.body.email });

      if (user) {
        return res
          .status(400)
          .json({ success,error: "The user with same email already exists" });
      }

      const salt = await bcrypt.genSalt(10);
      secPass = await bcrypt.hash(req.body.password, salt);
      //Creating new user
      user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: secPass,
      });
      const data = {
        user: {
          id: user.id,
        },
      };
      const authtoken = jwt.sign(data, JWT_SECRET);
      success = true;
      res.json({success, authtoken });
    } catch (error) {
      console.log(error.message);
      res.status(500).send("Some error ocured");
    }
  }
);

// Route 2: Authenticate a user using : POST "/api/auth/login" No login reqired
router.post(
  "/login",
  [
    body("email", "Enter a valid email").isEmail(),
    body("password", "Password cannot be blank").exists(),
  ],

  async (req, res) => {
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
      let user = await User.findOne({ email });
      if (!user) {
        success= false;
        return res
          .status(400)
          .json({ error: "Please try to login with correct ceredentials" });
      }
      const passwordCompare = await bcrypt.compare(password, user.password);
      if (!passwordCompare) {
        success = false;
        return res
          .status(400)
          .json({success, error: "Please try to login with correct ceredentials" });
      }
      const data = {
        user: {
          id: user.id,
          name: user.name,
        },
      };
      const authtoken = jwt.sign(data, JWT_SECRET);
      success = true;
      res.json({ success, authtoken });
    } catch (error) {
      console.log(error.message);
      res.status(500).send("Some error ocured");
    }
  }
);

//Route 3: Get logged in user details: POST "/api/auth/getuser". Login required
router.post("/getuser", fetchuser, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("-password");
    res.send(user);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Some error ocured");
  }
});

module.exports = router;
