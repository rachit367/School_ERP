const {sendOtpService,verifyOtpService, refreshTokenService}=require('./../services/authService');

async function sendOtp(req,res) {
    try{
        const result=await sendOtpService(req.body.phone,req.body.name);
        return res.json(result)
    }catch(err){
        next(err)
    }
}

async function verifyOtp(req,res) {
    try{
        const otp=req.body.otp;
        const phone=req.body.phone
        const result=verifyOtpService(otp,phone)
        return res.json(result)
    }catch(err){
        next(err)
    }
}

async function refreshToken(req,res){
    try{
        return res.json(refreshTokenService(req.body.refreshToken))
    }catch(err){
        next(err)
    }
}

module.exports={sendOtp,verifyOtp,refreshToken}