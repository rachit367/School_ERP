const mongoose = require('mongoose')

const otpSchema = new mongoose.Schema({
    phone:{
        type:String,
        required:true,
        unique:true
    },
    otp:{
        type:String,   //store otp in hashes
        required:true
    },
    expires_at:{
        type:Date,
        default:()=> new Date(Date.now() + 5 * 60 * 1000),
        index:{expires:'5m'}
    },
    name:{
        type:String,
        set: v => v.replace(/\b\w/g, c => c.toUpperCase())
    }
},{timestamps:true})

module.exports = mongoose.model('Otp', otpSchema)