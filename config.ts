let config;
let serverUrl = "https://localhost:3443";

export default config = {
    serverUrl: serverUrl,
    mongoUrl: "mongodb://localhost/fifaDB",
    emailVerificationOptions: {
        subject: "Fun Football - Please confirm your email ID",
        html: `Hello %s ,<br> Please Click on the link to verify your email.<br><a href=%s>Click here to verify</a>
        <br><br>Thanks, <br>Fun Football Team`,
        verifyEmailUrl: `${serverUrl}/account/verifyEmail?id=%s&token=%s`
    },
    forgotPasswordEmailOptions: {
        subject: "Fun Football - Your Verification Code",
        html: `Hello %s, <br><br> Please use following code to continue with the process of setting new password.
        <br><h2>%d</h2><br>Use this code within one hour.<br><br>Thanks,<br>Fun Football Team`,
    }
};