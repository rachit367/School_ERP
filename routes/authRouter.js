const express=require('express');
const router=express.Router()
const {sendOtp, verifyOtp, accessToken, getUserDetails}=require('./../controllers/authController');
const { authenticateToken } = require('../middlewares/authenticateToken');

//req:phone,name  //res:statusCode,message
router.post('/send-otp',sendOtp) 

//req:otp,phone //res:sucess,message,accessToken,refreshToken,user
router.post('/verify-otp',verifyOtp)

//req:refreshToken  //res:success,accessToken
router.post('/refresh-token',accessToken)

//req:    //res:user
router.get('/me',authenticateToken,getUserDetails)

module.exports=router