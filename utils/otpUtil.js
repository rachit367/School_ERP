const crypto=require('crypto')
function generateOtp(){
    const otp=crypto.randomInt(100000,999999).toString();
    return otp
}

function hashOtp(otp){
    return crypto.createHash("sha256").update(otp).digest("hex")
}

module.exports={generateOtp,hashOtp}