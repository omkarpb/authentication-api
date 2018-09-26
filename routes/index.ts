/// <reference path="../tsd.d.ts"/>
import {Request, Response} from "express";
var express = require("express");
import VerifyUtility from "../utilities/verify.utility";

var router = express.Router();

/* GET home page. */
router.get("/", VerifyUtility.authorizeUser, VerifyUtility.verifyEmail, function(req: Request, res: Response, next: Function) {
  res.send({
    "message": "Successful retrieval"
  });
});

module.exports = router;
