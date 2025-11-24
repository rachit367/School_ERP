const jwt=require('jsonwebtoken')

function generateAccessToken(user){
    try{
        const accessToken=jwt.sign({user_id:user._id,role:user.role},process.env.ACCESS_TOKEN_SECRET,{expiresIn:'15m'})
        return accessToken
    }catch(err){
        next(err)
    }
}

function generateRefreshToken(user){
    try{
        const refreshToken=jwt.sign({user_id:user._id,role:user.role},process.env.REFRESH_TOKEN_SECRET,{expiresIn:'30d'})
        return refreshToken
    }catch(err){
        next(err)
    }
}

module.exports={generateAccessToken,generateRefreshToken}