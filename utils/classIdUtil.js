const classModel=require('../models/classModel')

async function getClassId(Class,school_id){
    const class_name=Class.slice(0,-1)
    const section=Class.at(-1)
    const classDocs=await classModel.findOne({school_id:school_id,class_name:class_name,section:section})
    return classDocs._id
}

module.exports={getClassId}