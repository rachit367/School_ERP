const doubtModel=require('./../models/doubtModel')

//req:user_id
async function handleGetDoubts(user_id){
    const doubts=await doubtModel.find({teacher:user_id})
    .select('_id student_name class_name doubt status createdAt')
    .lean()
    return doubts
}

//req:doubt_id,reply   //res:success
async function handleUpdateDoubt(doubt_id,reply) { //send empty reply to mark doubt as resolved
    const doubt=await doubtModel.findOneAndUpdate({
        _id:doubt_id
    },{
        'reply.text':reply,
        'reply.replied_at':new Date(),
        status:'Resolved'
    })
    return {success:true}
}

module.exports={
    handleGetDoubts,
    handleUpdateDoubt
}