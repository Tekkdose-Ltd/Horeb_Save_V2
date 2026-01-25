import mongoose from "mongoose";

const contributionModelSchema =  new mongoose.Schema({
  is_contribution_cancelled:{
    type:Boolean,
    default:false
  },
  processingPayment:{
    type:mongoose.Schema.Types.Boolean,
    default:false
  },
    group_id:{
        type:mongoose.Schema.ObjectId,
        required:[true,'group id must be provided'],
        ref:'groups'
    },

   
    constribution_started:{
    type:mongoose.Schema.Types.Boolean,
    default:false
    },

     constribution_ended:{
    type:mongoose.Schema.Types.Boolean,
    default:false
    },
   
    member_completed_payment:{
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
                transactionDetails:{
                type:mongoose.Schema.ObjectId,
                ref:'transactions'
                },
               payment_status:{
                type:mongoose.SchemaTypes.String,
                enum:['paid','not_paid'],
                default:'not_paid'
             },
            
       contributed_at:{
        type:mongoose.Schema.Types.Date,
        default:Date.now()
    },
          }],

          member_due_for_payment:{
            type:mongoose.Schema.ObjectId,
         
         }



},{timestamps:true});

export const ContributionModel = mongoose.model('contributions',contributionModelSchema);
   