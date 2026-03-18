import mongoose from "mongoose";

const contributionModelSchema =  new mongoose.Schema({
  
    group_id:{
        type:mongoose.Schema.ObjectId,
        required:[true,'group id must be provided'],
        ref:'groups'
    },

   
    constribution_started:{
    type:mongoose.Schema.Types.Boolean,
    default:false
    },

    amount:{
        type:mongoose.Schema.Types.Number,
        required:[true,'contribution amount must be provided']
    },


      current_round:{
            type:mongoose.SchemaTypes.Number,
            default:0
         },

          members_paid:[{
             member_id:{
                type:mongoose.Schema.ObjectId,
                ref:'users'
             },
            
    contributed_at:{
        type:mongoose.Schema.Types.Date,
        default:Date.now()
    },
          }],

          member_due_for_payment:{
            type:mongoose.Schema.ObjectId,
         
         }



});

export const ContributionModel = mongoose.model('contributions',contributionModelSchema);
   