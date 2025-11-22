function errorHandling(err,req,res,next){
    console.log(err.stack);
    const error=err.message || "Internal Server Error";
    const code=err.statusCode || 500
    res.status(code).json({
        success:false,
        message:error
    })
}

module.exports=errorHandling