const userModel = require('./../models/userModel');
const otpModel = require('./../models/otpModel');
const { generateOtp, hashOtp } = require('./../utils');
const jwt = require('jsonwebtoken');
const { generateAccessToken, generateRefreshToken } = require('../utils/tokenUtil');
const { capitalizeEveryWord, normalizePhone } = require('../utils/loginUtils');

async function sendOtpService(phone, name) {
    const normalizedPhone = normalizePhone(phone);
    const capitalName = capitalizeEveryWord(name);

    const user = await userModel.findOne({ name: capitalName, phone: normalizedPhone });
    if (!user) return { statuscode: 401, message: "User not found" };

    const otp = generateOtp();
    const hashedOtp = hashOtp(otp);

    await otpModel.findOneAndUpdate(
        { phone: normalizedPhone },
        { otp: hashedOtp, name:capitalName ,expires_at: new Date(Date.now() + 5*60*1000) },
        { upsert: true }                    //if multiple otp are generted it will replace them and i have unique numebr so every number will have one otp for 5 min
    );

    // Send OTP with your SMS provider here
    console.log("OTP for testing:", otp);

    return { statuscode: 200, message: "OTP sent successfully" };
}

async function verifyOtpService(otp, phone) {
    const normalizedPhone = normalizePhone(phone);
    const hashedOtpFromDB = await otpModel.findOne({ phone: normalizedPhone });

    if (!hashedOtpFromDB) {
        return { success: false, message: "OTP not found or expired" };
    }

    const hashedOtp = hashOtp(otp);
    if (hashedOtp !== hashedOtpFromDB.otp) {
        return { success: false, message: "Invalid OTP" };
    }

    const capitalName = hashedOtpFromDB.name
    const user = await userModel.findOne({ name: capitalName, phone: normalizedPhone });

    if (!user) {
        return { success: false, message: "User not found" };
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    await otpModel.deleteOne({ phone: normalizedPhone }); // delete used OTP

    return {
        success: true,
        message: "OTP verified",
        accessToken,
        refreshToken,
        user
    };
}

async function refreshTokenService(refreshToken) {     // use refresh token rotation for better security afterwards
    if (!refreshToken) return { success: false, message: "Refresh token required" };

    let decoded;
    try {
        decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch (err) {
        return { success: false, message: "Invalid or expired refresh token" };
    }
    const user = await userModel.findById(decoded.user_id);

    if (!user || user.refreshToken !== refreshToken) {
        return { success: false, message: "Invalid refresh token" };
    }

    const newAccessToken = generateAccessToken(user);

    return {
        success: true,
        accessToken: newAccessToken
    };
}

module.exports = {
    sendOtpService,
    verifyOtpService,
    refreshTokenService
};
