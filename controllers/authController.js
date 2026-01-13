const {sendOtpService,verifyOtpService, refreshTokenService, handleGetUserDetails}=require('./../services/authService');

//req:phone,name  //res:statusCode,message
async function sendOtp(req,res,next) { 
    try{
        const result=await sendOtpService(req.body.phone,req.body.name);
        return res.status(result.statusCode || 200).json(result);
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
        if (!result.success) {
            return res.status(400).json(result);
        }
return res.status(200).json(result);
    }catch(err){
        next(err)
    }
}

//req:refreshToken  //res:success,accessToken
async function refreshToken(req,res,next){ 
    try {
    const refreshToken = req.headers['x-refresh-token'];

    if (!refreshToken) {
      const err = new Error('Refresh token missing');
      err.statusCode = 401;
      throw err;
    }

    const result = await refreshTokenService(refreshToken);

    if (!result.success) {
      const err = new Error(result.message);
      err.statusCode = 401;
      throw err;
    }

    return res.status(200).json({
      success: true,
      accessToken: result.accessToken
    });

  } catch (err) {
    next(err);
  }
}

//req:    //res:user
async function getUserDetails(req,res,next){
    try{
        const user=await handleGetUserDetails(req.user_id)
        return res.status(200).json(user)
    }catch(err){
        next(err)
    }
}
module.exports={sendOtp,verifyOtp,refreshToken,getUserDetails}