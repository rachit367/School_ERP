const {sendOtpService,verifyOtpService, refreshTokenService}=require('./../services/authService');

//req:phone,name  //res:statusCode,message
async function sendOtp(req,res,next) { 
    try{
        const result=await sendOtpService(req.body.phone,req.body.name);
        return res.json(result)
    }catch(err){
        next(err)
    }
}

//req:otp,phone //res:sucess,message,accessToken,refreshToken,user
async function verifyOtp(req,res,next) { 
    try{
        const otp=req.body.otp;
        const phone=req.body.phone
        const result=await verifyOtpService(otp,phone)
        return res.json(result)
    }catch(err){
        next(err)
    }
}

//req:refreshToken  //res:success,accessToken
async function refreshToken(req,res,next){ 
    try{
        const result = await refreshTokenService(req.body.refreshToken); 
        return res.json(result);
    }catch(err){
        next(err)
    }
}

module.exports={sendOtp,verifyOtp,refreshToken}