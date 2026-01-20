const {
    handleGetStats,
    handleGetAllBullyReport,
    handleMarkBullyReport,
    handleDeleteBullyReport,
}=require('../services/principalService')

async function getStats(req,res,next){
    try{
        const school_id=req.school_id
        const result=await handleGetStats(school_id)
        return res.status(200).json(result)
    }catch(err){
        next(err)
    }
}

async function getAllBullyReports(req, res, next){
  try {
    const school_id=req.school_id
    const data=await handleGetAllBullyReport(school_id)
    return res.status(200).json(data);
  } catch (err) {
    next(err);
  }
};

async function markBullyReport(req, res, next){
  try {
    const school_id=req.school_id
    const report_id=req.params.id
    const data=await handleMarkBullyReport(school_id,report_id)
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
};

async function deleteBullyReport(req, res, next){
  try {
    const school_id=req.school_id
    const report_id=req.params.id
    const data=await handleDeleteBullyReport(school_id,report_id)
    return res.status(200).json(data);
  } catch (err) {
    next(err);
  }
};

module.exports={
    getStats,
    markBullyReport,
    getAllBullyReports,
    deleteBullyReport
}