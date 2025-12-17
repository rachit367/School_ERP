const {handleGetStats}=require('./../services/principalDashboardService')

async function getStats(req,res,next){
    try{
        const result=await handleGetStats(req.school_id)
        return res.status(200).json(result)
    }catch(err){
        next(err)
    }
}

module.exports={getStats}