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
        default:null
    },
    total_students:{
        type:Number,
        min:0,
        default:0
    },
    total_teachers:{
        type:Number,
        min:0,
        default:0
    },
    logo:{
        type:String,
        default:null
    },
    plan:{
        type:String,
        enum:['Assist','Autonomy','Automate'],
        default:'Assist'
    }
},{timestamps:true})



module.exports=mongoose.model('School',schoolSchema)