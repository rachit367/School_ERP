const {handleGetStats}=require('./../services/principalDashboardService')

async function getStats(req,res,next){
    try{
        const result=await handleGetStats(req.body.school_id)
        return result
    }catch(err){
        next(err)
    }
}

module.exports={getStats}