/// <reference path="./tsd.d.ts"/>


import * as express from "express";
import * as mongoose from "mongoose";
var path = require("path");
var favicon = require("serve-favicon");
var morgan = require("morgan");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var passport = require("passport");

var routes = require("./routes/index");
import accountRoute from "./routes/account.route";
import accountModel from "./models/account.model";
import config from "./config";
import logger from "./utilities/logger.utility";
var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));


mongoose.connect(config.mongoUrl);

var db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("Connected to Mongodb");
});


// passport config
app.use(passport.initialize());
passport.use(accountModel.createStrategy());
passport.serializeUser(accountModel.serializeUser());
passport.deserializeUser(accountModel.deserializeUser());


app.all("*", function (req: express.Request, res: express.Response, next: Function) {
  if (req.secure) {
    return next();
  }
  res.redirect("https://" + req.hostname + ":" + app.get("secPort") + req.url);
});

app.use("/", routes);
app.use("/account", accountRoute);


// catch 404 and forward to error handler
app.use((req: express.Request, res: express.Response, next: Function) => {
  var err: any = new Error("Not Found");
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get("env") === "development") {
  app.use(function(err: any, req: express.Request, res: express.Response, next: Function) {
    res.status(err.status || 500).json({
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err: any, req: express.Request, res: express.Response, next: Function) {
  res.status(err.status || 500).json({
    message: err.message,
    success: false
  });
});


module.exports = app;
