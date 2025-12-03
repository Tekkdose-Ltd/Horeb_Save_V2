import mongoose from "mongoose";
import { boolean } from "zod";



const waitListSchema = new mongoose.Schema({

first_name:{
    type:String
},
last_name:{
  type:String  
},
email:{
    type:String
},
phone_number:{
    type:String
},
saving_method:{
    type:String
},
income_pattern:{
    type:String
},
priority:{
 type:String
},
goal:{
    type:String
},
early_access:{
    type:String
},
joined_at:{
    type:Date,
    default:Date.now()
},
notified:{
    type:boolean
}



},{timestamps:true})


export const newWaitlistModel = mongoose.model('waitlist',waitListSchema)