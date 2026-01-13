const {handleGetStats}=require('./../services/principalDashboardService')

async function getStats(req,res,next){
    try{
        const school_id=req.school_id
        const result=await handleGetStats(school_id)
        return res.status(200).json(result)
    }catch(err){
        next(err)
    }
}

module.exports={getStats}