const nodemailer = require("nodemailer");

// Create transporter
const transporter = nodemailer.createTransport({
    service: "gmail", // change if needed
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS // App password
    }
});

// Verify transporter
transporter.verify((err, success) => {
    if (err) {
        console.error("Mail Server Error:", err);
    } else {
        console.log("Mail Server Ready");
    }
});

/**
 * Send OTP Email
 * @param {string} toEmail
 * @param {string|number} otp
 */
async function sendOtpMail(toEmail, otp) {

    const mailOptions = {
        from: `"OTP Service" <${process.env.MAIL_USER}>`,
        to: toEmail,
        subject: "Your OTP Verification Code",
        html: `
            <div style="font-family: Arial, sans-serif;">
                <h2>OTP Verification</h2>
                <p>Your One-Time Password is:</p>
                <h1 style="letter-spacing:3px;">${otp}</h1>
                <p>This OTP is valid for 5 minutes.</p>
                <p>Do not share it with anyone.</p>
            </div>
        `
    };

    // If error happens → it will be thrown automatically
    return transporter.sendMail(mailOptions);
}

module.exports = {
    sendOtpMail
};