//requiring the useful modules
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const passport = require("passport");

//requiring the routes
const users = require("./routes/users");
const travel = require("./routes/travel");

//initializing the express app
const app = express();

//parsing-body for the put and post routes
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//using index path for both routes
app.use("/", users);
app.use("/", travel);

//requiring config keys for mongo URI
const db = require("./config/keys").mongoURI;

//connecting to cloud db through mongoose orm
mongoose
  .connect(
    db,
    { useNewUrlParser: true },
    { useFindAndModify: false },
    { useUnifiedTopology: true }
  )
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

//initializing passport module
app.use(passport.initialize());
//passport config
require("./config/passport.js")(passport);

//setting up the port
const port = process.env.PORT || 5001;

//test route
app.get("/", (req, res) => {
  res.send("working");
});

//server connection route
app.listen(port, () => {
  console.log("successfully connected to port");
});
