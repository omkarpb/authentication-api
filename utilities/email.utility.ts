/// <reference path="../tsd.d.ts"/>

import * as nodemailer from "nodemailer";
import logger from "./logger.utility";
import config from '../config';

var smtpTransport = nodemailer.createTransport({
    host: "smtp.gmail.com",
    service: "Gmail",
    auth: {
        type: "OAuth2",
        user: "omkarbadve89@gmail.com",
        clientId: "837850744583-03ke71abl7v50uvgrgla7d3hkpr8dc2b.apps.googleusercontent.com",
        clientSecret: "KKzoaVhRCVKgCknhvcURdJ5Z",
        accessToken: "ya29.Glt7BYrP7GOZUCBjdHBhDpIcmnXK2L37Qttm0eThDstr5bned5cMibLbcE_tshVXthhzA1s6mwODdnSQshSgkx-kt6eCS6_ZbOb4rOMfdCJuLlzOIMgD9jcpQifZ",
        refreshToken: "1/ld1dPVOjcpW5AQIe4XP6u0q1IhrAGJ2H4hwky8ZhUM8"
    }
});

export default class EmailUtility {
    public static sendEmail = function (toEmail: string, subject: string, htmlContent: string) {
        let mailOptions = {
            from: "Omkar Badve <omkarbadve89@gmail.com>",
            to: toEmail,
            subject: subject,
            html: htmlContent
        }
        smtpTransport.sendMail(mailOptions, function (error, response) {
            if (error) {
                logger.error(error);
            } else {
                logger.info("Email sent");
            }
        });
    }
}


// export let sendEmail = function (toEmail: string, firstName: string) {
//     var mailOptions = {
//         from: "Omkar Badve <omkarbadve89@gmail.com>",
//         to: toEmail,
//         subject: "Please confirm your Email account",
//         html: "Hello ," + firstName + "<br> Please Click on the link to verify your email.<br><a href=" + ">Click here to verify</a>"
//     };
//     smtpTransport.sendMail(mailOptions, function (error, response) {
//         if (error) {
//             logger.error(error);
//             // res.status(500).end("error");
//         } else {
//             logger.info("Email sent");
//             // res.status(200).json({ status: "Email sent for verification" });
//         }
//     });
// }