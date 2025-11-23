const mongoose = require('mongoose')

const otpSchema = new mongoose.Schema({
    phone:{
        type:String,
        required:true
    },
    otp:{
        type:String,   //store otp in hashes
        required:true
    },
    expires_at:{
        type:Date,
        default:()=> new Date(Date.now() + 5 * 60 * 1000),
        index:{expires:'5m'}
    }
},{timestamps:true})

module.exports = mongoose.model('Otp', otpSchema)