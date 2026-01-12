const mongoose = require('mongoose')

const otpSchema = new mongoose.Schema({
  phone:{
    type:String,
    required:true,
    unique:true
  },

  otp:{
    type:String,
    required:true   //store otp in hashes in production
  },

  expires_at:{
    type:Date,
    default: Date.now
  },

  name:{
    type:String,
    set: v => v.replace(/\b\w/g, c => c.toUpperCase())
  }
},{timestamps:true})


// TTL index
otpSchema.index(
  { expires_at:1 },
  { expireAfterSeconds:300 }
)

module.exports = mongoose.model('Otp', otpSchema)
