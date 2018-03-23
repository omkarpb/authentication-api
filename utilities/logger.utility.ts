/// <reference path="../tsd.d.ts"/>
let winston = require('winston');
let moment = require('moment');

let currentDate = moment().format('YYYY-MM-DD');

let logger;

export default logger =  winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.prettyPrint()
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'logs/log-'+currentDate+'.log'})
    ]
});
