import mongoose from "mongoose";


const  groupTrustRatingSchema = new mongoose.Schema({

    group_id:{
        type:mongoose.Schema.ObjectId,
        required:[true,'group id must be provided'],
        ref:'groups'
    },

    member_id:{
        type:mongoose.Schema.ObjectId,
        required:[true,'member id must be provided'],
        ref:'users'
    },

    description:{
        type:mongoose.Schema.Types.String,
    },

    trust_rating:{
        type:mongoose.Schema.Types.Number,
        required:[true,'trust rating must be provided']
    },
    rated_by:{
        type:mongoose.Schema.ObjectId,
        required:[true,'rater id must be provided'],
        ref:'users'
    }

},{timestamps:true});

export const GroupTrustRatingModel = mongoose.model('group_member_trust_ratings',groupTrustRatingSchema);