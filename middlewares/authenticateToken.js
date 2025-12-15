const jwt=require('jsonwebtoken')

async function authenticateToken(req,res,next){
    try{
        const authHeader=req.headers.authorization
        if (!authHeader) {
            const error = new Error("Authorization header missing");
            error.statusCode = 401;
            return next(error);
        }
        const token=authHeader.split(" ")[1]
        if(!token){
            const error = new Error("Access token missing");
            error.statusCode = 401;
            return next(error);
        }
        const decoded=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
        req.user_id=decoded.user_id
        next()
    }catch(err){
        if (err.name === "TokenExpiredError") {
            err.statusCode = 401;
            err.message = "Access token expired";
        } else {
            err.statusCode = 401;
            err.message = "Invalid access token";
        }
        return next(err);
    }
}

module.exports={authenticateToken}