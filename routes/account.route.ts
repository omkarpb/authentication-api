/// <reference path="../tsd.d.ts"/>

import { Request, Response } from "express";
import * as express from "express";
import * as passport from "passport";
import Account from "../models/account.model";
import * as passportLocalMongoose from "passport-local-mongoose";
import VerifyUtility from "../utilities/verify.utility";
import logger from "../utilities/logger.utility";
import AccountEntity from "../entities/account.entity";
import EmailUtility from "../utilities/email.utility";
import ResponseUtility from "../utilities/response.utility";
import config from "../config";
import * as uuid from "uuid/v4";
import * as randomInt from "random-int";
import { accessSync } from "fs";
import * as moment from "moment";

let util = require("util");

var router = express.Router();

/**
 * User account registration with email ID
 */
router.post("/register", function (req: Request, res: Response, next: Function) {
    try {
        Account.register(new Account({
            email: req.body.email.toString().toLowerCase(),
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            token: uuid()
        }), req.body.password, function (err: any, account: AccountEntity) {
            if (err) {
                logger.error(err);
                return ResponseUtility.sendJson(res, 400, err);
            }
            logger.info(`User received to register ${req.body.email} ${req.body.firstName} ${req.body.lastName} `);
            EmailUtility.sendEmail(req.body.email, config.emailVerificationOptions.subject,
                util.format(config.emailVerificationOptions.html, req.body.firstName,
                    util.format(config.emailVerificationOptions.verifyEmailUrl, account._id, account.token)));
            ResponseUtility.sendJson(res, 200, {
                message: "User is registered successfully",
            });
            logger.info("user registered successfully");
        });
    } catch (err) {
        ResponseUtility.sendJson(res, 500, err);
    }
});

/**
 * Verification of email id of user
 */
router.get("/verifyEmail", (req: Request, res: Response, next: Function) => {
    try {
        if (req.query.id && req.query.token) {
            logger.info(`Verifying email of id ${req.query.id}`);
            Account.findById(req.query.id, (err: any, account: AccountEntity) => {
                if (err) {
                    return ResponseUtility.sendJson(res, 400, err);;
                } else if (account) {
                    logger.info(`User record found for id ${req.query.id}`);
                    if (account.isActive) {
                        ResponseUtility.sendJson(res, 200, {
                            message: `Email is already verified`,
                        });
                    } else if (account.token === req.query.token) {
                        Account.updateOne({ "_id": req.query.id }, { "isActive": true }, (err: any, raw: any) => {
                            if (err) {
                                return next(err);
                            }
                            logger.info(`Email is verified successfully for ${req.query.id}`);
                            ResponseUtility.sendJson(res, 200, {
                                message: `Email is verified successfully`,
                            });
                        });
                    } else {
                        return ResponseUtility.sendJson(res, 400, new Error("Invalid request: Invalid token provided"));
                    }
                } else {
                    return ResponseUtility.sendJson(res, 400, new Error("Invalid request: No user found"));
                }
            });
        }
    } catch (err) {
        return ResponseUtility.sendJson(res, 500, err);
    }
});

/**
 * User account login with email id
 */
router.post("/login", function (req: Request, res: Response, next: Function) {
    try {
        passport.authenticate("local", function (err: any, user: AccountEntity, info: any) {
            if (err) {
                logger.error(err);
                return ResponseUtility.sendJson(res, 400, err);
            }
            if (!user) {
                logger.error("User does not exist");
                let err: any = new Error();
                err.message = info;
                return ResponseUtility.sendJson(res, 401, err);
            }

            req.logIn(user, function (err: any) {
                if (err) {
                    logger.error(err);
                    return ResponseUtility.sendJson(res, 400, err);
                }

                var token = VerifyUtility.getJWToken(user);

                ResponseUtility.sendJson(res, 200, {
                    message: "User is logged in successfully",
                    token: token
                });
            });
        })(req, res, next);
    } catch (err) {
        next(err);
    }
});

/**
 * User account lougout
 */
router.get("/logout", function (req: Request, res: Response) {
    req.logout();
    ResponseUtility.sendJson(res, 200, {
        message: "user is logged out successfully",
    });
});

/**
 * User account update
 */
router.put("/", function (req: Request, res: Response, next: Function) {
    try {
        Account.findOneAndUpdate({ "email": req.body.email }, {
            "firstName": req.body.firstName,
            "lastName": req.body.lastName
        }, (err: any, account: any) => {
            if (err) {
                return ResponseUtility.sendJson(res, 500, err);
            }
            if (req.body.password && req.body.newPassword) {
                account.changePassword(req.body.password, req.body.newPassword, (err: any) => {
                    if (err) {
                        return ResponseUtility.sendJson(res, 400, err);
                    }
                    logger.info("Password updated successfully");
                });
            }
            logger.info("Account updated successfully");
            return ResponseUtility.sendJson(res, 200, {
                message: "Account updated successfully",
            });
        });
    } catch (err) {
        return ResponseUtility.sendJson(res, 500, err);
    }
});

/**
 * Handles forgotpassword operation
 */
router.post("/forgotPassword", (req: Request, res: Response, next: Function) => {
    Account.findOne({ "email": req.body.email }, (err: any, account: AccountEntity) => {
        if (err) {
            logger.error(err);
            return ResponseUtility.sendJson(res, 500, err);
        }
        logger.info("Email verified - " + req.body.email);
        if (account) {
            let code = randomInt(1000, 9999);
            Account.findByIdAndUpdate(account._id, { "code": code, "codeExpireTime": moment().add(1, "hours") })
                .then((result: any) => {
                    logger.info("Code updated in db");
                    EmailUtility.sendEmail(account.email, config.forgotPasswordEmailOptions.subject,
                        util.format(config.forgotPasswordEmailOptions.html, account.firstName, code));
                    ResponseUtility.sendJson(res, 200, {
                        message: "Email is sent to user with code",
                    });
                })
                .catch((err: any) => {
                    logger.error(err);
                    return ResponseUtility.sendJson(res, 500, err);
                });
        } else {
            return ResponseUtility.sendJson(res, 401, new Error("Email cannot be verified"));
        }
    });
});

/**
 * verifies code submitted by user for new password generation
 */
router.post("/verifyCode", (req: Request, res: Response, next: Function) => {
    if (req.body.email && req.body.code && req.body.password) {
        Account.findOne({ "email": req.body.email })
            .then((account: AccountEntity) => {
                if (account && account.code && account.code === Number(req.body.code) && account.codeExpireTime > new Date()) {
                    logger.info("Code is verified");
                    Account.findOne({ "email": req.body.email }, (err: any, account: any) => {
                        if (err) {
                            return ResponseUtility.sendJson(res, 500, err);
                        }
                        account.setPassword(req.body.password, (err: any, model: any, passwordErr: any) => {
                            if (err) {
                                return ResponseUtility.sendJson(res, 500, err);
                            }
                            if (passwordErr) {
                                return ResponseUtility.sendJson(res, 500, passwordErr);
                            }
                            model.save();
                            ResponseUtility.sendJson(res, 200, {
                                message: "Password is set successfully",
                            });
                        });
                    });
                } else {
                    throw ResponseUtility.sendJson(res, 401, new Error("Code cannot be verified"));
                }
            })
            .catch((err: any) => {
                return ResponseUtility.sendJson(res, 500, err);
            });
    } else {
        return ResponseUtility.sendJson(res, 400, new Error("Data is missing"));
    }
});

export default router;
