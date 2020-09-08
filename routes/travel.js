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
//convering string into object
let parsedContent = JSON.parse(content);
//converting objct into array
let entries = Object.entries(parsedContent);

//test route

/**
 * @swagger
 * /:
 *  get:
 *    description: To check whether the api is working or not
 *    responses:
 *      '200':
 *        description: A successful response
 */

router.get("/index", (req, res) => {
  res.send("working");
});

//ROUTES
//route for getting details about one particular user
/**
 * @swagger
 * /userDetails:
 *    post:
 *      description: To get the details of specific customer
 *    parameters:
 *      - name: email
 *        in: body
 *        description: email of our customer
 *        required: true
 *        schema:
 *          type: string
 *          format: string
 *    responses:
 *      '200':
 *        description: Successfully fetched user details
 */

router.post("/userDetails", async (req, res) => {
  try {
    let user = await User.findOne({ email: req.body.email });
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
/**
 * @swagger
 * /user/history:
 *    post:
 *      description: To return all the travel details of the user
 *    parameters:
 *      - name: email
 *        in: body
 *        description: unique email of our customer
 *        required: true
 *        schema:
 *          type: string
 *          format: string
 *    responses:
 *      '200':
 *        description: Successfully fetched user's travel history
 */

router.post(
  "/user/history",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      let userHistory = await User.findOne({ email: req.body.email });
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

/**
 * @swagger
 * /travel/id:
 *    put:
 *      description: To Update the user document with nearest cab drivers
 *    parameters:
 *      - name: id
 *        in: query
 *        description: unique id of our customer
 *        required: true
 *        schema:
 *          type: string
 *          format: string
 *    responses:
 *      '201':
 *        description: Successfully displayed near by cabs
 */

router.put(
  "/travel/:id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    let time = `${date.getDate()}/${date.getMonth() +
      1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
    try {
      const pickup = req.body.pickup.toLowerCase();
      const { destination } = req.body;
      //matching the nearest users
      let filteredArray = entries.filter(i => i[1].area === pickup);
      //getting the id of user
      const id = req.params.id;
      //fetching user's doucument
      let data = await User.findById(id);
      //if no user found
      if (!data) {
        res.status(404).json("there is no user registered with this email");
        //if user found and the user did not call the cab more than 5 times
      } else if (data.count <= 4) {
        if (filteredArray.length === 0) {
          filteredArray = "Sorry All The Drivers Are Busy At The Moment";
          return res.status(404).send("We Do not Operate In that area");
        } else {
          const details = {
            pickup,
            destination,
            availablecabs: filteredArray,
            time: time,
            cabs: entries.length
          };
          data.trip.push(details);
          data.count += 1;
          const updateData = await User.findByIdAndUpdate(req.params.id, data);
          if (updateData) {
            return res.status(200).json({ bestDriver: details });
          } else {
            return res.status(404).json("no user found with the provided id");
          }
        }
      }
      //if user called cab more than 5 times
      else {
        res
          .status(403)
          .json(
            "you should not travel more during these times. Stay Home Stay Safe"
          );
      }
    } catch (e) {
      console.log(e);
      res.status(500).json("Internal error");
    }
  }
);

module.exports = router;
