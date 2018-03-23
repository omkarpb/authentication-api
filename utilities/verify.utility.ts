/// <reference path="../tsd.d.ts"/>
import * as jwt from 'jsonwebtoken';
import { Request, Response } from "express";
import Account from '../models/account.model';
import logger from "../utilities/logger.utility";
import AccountEntity from '../entities/account.entity';

export default class VerifyUtility {
    /**
     * getJWToken
     */
    public static getJWToken(user: any): string {
        let userObject = JSON.parse(JSON.stringify(user));
        return jwt.sign(userObject, 'secret', {
            expiresIn: 3600
        });
    }

    public static authorizeUser(req: Request, res: Response, next: Function) {
        var token = req.body.token || req.query.token || req.headers['x-access-token'];
        //decode token
        if (token) {
            jwt.verify(token, 'secret', function (err: any, decoded: any) {
                if (err) {
                    var error: any = new Error('You are not authenticated....!!!!');
                    error.status = 401;
                    return next(error);
                }
                else {
                    req["decoded"] = decoded;
                    next();
                }
            })
        }
        else {
            var err: any = new Error('No token provided');
            err.status = 403;
            return next(err);
        }
    }

    public static verifyEmail(req: Request, res: Response, next: Function) {
        Account.findById(req['decoded']['_id'], (err: any, user: AccountEntity) => {
            if (err) {
                return next(err);
            }
            if (user.isActive) {
                next();
            } else {
                let err: any = new Error('User email is not verified');
                err.status = 400;
                return next(err);
            }
        });
    }
}