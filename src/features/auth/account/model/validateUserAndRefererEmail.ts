import mongoose from "mongoose";
import { boolean } from "zod";


const newUSerAndRefererEmailSchema =  new mongoose.Schema({
    who_to_validate: { type: String, required: true,enum:['user_email','referer_email'] },
    email_to_validate: { type: String, required: true },
    standing_for:{ type: String, required: true },
    magic_link: { type: String, required: true },
    user_validated_email:{ type: boolean },
    surety_consent:{ type: boolean },
    temp_data:{ type: mongoose.Schema.Types.Mixed },
    createdAt:{
     type:Date,
     expires:'10m',
     default:Date.now
    }
})

export const ValidateUserAndRefererEmail = mongoose.model('ValidateUserAndRefererEmail',newUSerAndRefererEmailSchema);