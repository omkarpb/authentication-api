import { Response } from "express";

export default class ResponseUtility {
    public static sendJson(res: Response, statusCode: number, payload: any) {
        res.status(statusCode);
        if (statusCode !== 200) {
            res.json({
                message: payload.message || 'Unknown error occurred',
            });
        } else {
            res.json(payload);
        }
    }
}