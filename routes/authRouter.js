const express=require('express');
const router=express.Router()
const {sendOtp, verifyOtp, refreshToken}=require('./../controllers/authController')

router.post('/sendotp',sendOtp)

router.post('/verifyotp',verifyOtp)

router.post('/refreshtoken',refreshToken)

module.exports=router