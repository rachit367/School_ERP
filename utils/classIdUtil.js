const classModel=require('../models/classModel')

async function getClassId(Class, school_id) {
    if (!Class || typeof Class !== 'string' || Class.length < 2) {
        throw new Error("Invalid Class format. Expected format: '5A', '10B', etc.");
    }
    
    const section = Class.at(-1);
    const class_name = Number(Class.slice(0, -1));
    
    if (isNaN(class_name)) {
        throw new Error("Invalid class name format");
    }
    
    const classDocs = await classModel.findOne({
        school_id: school_id,
        class_name: class_name,
        section: section
    });
    
    if (!classDocs) throw new Error("Class not found");
    return classDocs._id;
}

module.exports={getClassId}