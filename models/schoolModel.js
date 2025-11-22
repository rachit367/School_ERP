const mongoose=require('mongoose')

const schoolSchema=new mongoose.Schema({
    name:{
        required:true,
        type:String
    },
    address:{
        type:String
    },
    principal_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    }
},{timestamps:true})

module.exports=mongoose.model('School',schoolSchema)