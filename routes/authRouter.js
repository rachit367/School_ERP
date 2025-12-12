const express=require('express');
const router=express.Router()
const {sendOtp, verifyOtp, refreshToken}=require('./../controllers/authController')

//req:phone,name  //res:statusCode,message
router.post('/send-otp',sendOtp) 

//req:otp,phone //res:sucess,message,accessToken,refreshToken,user
router.post('/verify-otp',verifyOtp)

//req:refreshToken  //res:success,accessToken
router.post('/refresh-token',refreshToken)

module.exports=router