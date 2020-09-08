//requiring the modules
const router = require("express").Router();
const User = require("../models/User");
const fs = require("fs");
const passport = require("passport");
let date = new Date();

//for reading json files
let content = fs.readFileSync(
  "/home/bharath/Videos/athreva-project/routes/cabs.json",
  "utf-8"
);
//generating random cars
let avalailableCabs = 10;
//convering string into object
let parsedContent = JSON.parse(content);
//converting objct into array
let entries = Object.entries(parsedContent);
//custom function for generating random driver
function randomDriver(i) {
  return Math.floor(Math.random() * i);
}
//ROUTES
//route for getting details about one particular user
router.get("/:id", async (req, res) => {
  try {
    let user = await User.findById(req.params.id);
    console.log(user);
    if (!user) {
      return res.status(404).json("User Not Found");
    } else {
      res.status(200).json({ user });
    }
  } catch (e) {
    console.log(e);
    res.status(500).json("Internal Server Error");
  }
});

//Route for getting details of travel history of the user
router.get(
  "/user/history/:id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      let userHistory = await User.findById(req.params.id);
      if (userHistory.trip.length > 0) {
        res.status(200).json(userHistory.trip);
      } else {
        res.status(404).json("No History Found");
      }
    } catch (e) {
      res.status(500).json("Internal server error");
    }
  }
);

//Route for getting the nearest and best driver based on the pickup points
router.put(
  "/travel/:id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    let allCabs = Math.floor(Math.random() * avalailableCabs);
    console.log(34, allCabs);
    let time = `${date.getDate()}/${date.getMonth() +
      1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
    let driver = await randomDriver(entries.length);
    let best = entries[driver][1];
    console.log(best);
    try {
      const { pickup, destination } = req.body;
      const id = req.params.id;
      let data = await User.findById(id);
      if (!data) {
        res.status(404).json("there is no user registered with this email");
      } else {
        if (data.count) {
          const details = {
            pickup,
            destination,
            cabs: allCabs,
            driverDetails: best,
            time: time
          };
          data.trip.push(details);
          console.log(data, "33");
          data.count += 1;
          const updateData = await User.findByIdAndUpdate(req.params.id, data);
          if (updateData) {
            return res
              .status(200)
              .json({ bestDriver: best, NoOfCabs: allCabs });
          } else {
            return res.status(404).json("no user found with the provided id");
          }
        } else {
          res.status(403).json("you have reached your quota");
        }
      }
    } catch (e) {
      console.log(e);
      res.status(500).json("Internal error");
    }
  }
);

module.exports = router;
