///<reference path="../tsd.d.ts" />
import * as mongoose from "mongoose";
import * as passportLocalMongoose from "passport-local-mongoose";

let account = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        match: /\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\b/,
    },
    password: {
        type: String
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    isActive: {
        type: Boolean,
        default: false
    },
    token: String,
    code: Number,
    codeExpireTime: Date
});

account.plugin(passportLocalMongoose, {
    usernameField: "email"
});

export default mongoose.model("Account", account) as mongoose.PassportLocalModel<any>;
