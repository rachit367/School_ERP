const {
    handleGetDoubts,
    handleUpdateDoubt
}=require('./../services/doubtService')

async function getDoubts(req, res, next){
  try {
    const user_id=req.user_id
    const result=await handleGetDoubts(user_id)
    res.status(200).json(result);

  } catch (err) {
    next(err);
  }
};


//req:user_id,doubt_id //res:success
async function updateDoubt(req, res, next){
  try {
    //send empty reply to mark doubt as resolved
    const reply=req.reply ?? ''
    const doubt_id=req.params.id
    const result=await handleUpdateDoubt(doubt_id,reply)
    res.status(200).json({result});

  } catch (err) {
    next(err);
  }
};