const jwt=require('jsonwebtoken')

function generateAccessToken(user){
    try{
        const accessToken=jwt.sign({user_id:user._id,role:user.role,school_id:user.school_id},process.env.ACCESS_TOKEN_SECRET,{expiresIn:'30d'})  //chnage it to 30m afterwardss in production
        return accessToken
    }catch(err){
        throw err
    }
}

function generateRefreshToken(user){
    try{
        const refreshToken=jwt.sign({user_id:user._id,role:user.role,school_id:user.school_id},process.env.REFRESH_TOKEN_SECRET,{expiresIn:'30d'})
        return refreshToken
    }catch(err){
        throw err
    }
}

module.exports={generateAccessToken,generateRefreshToken}