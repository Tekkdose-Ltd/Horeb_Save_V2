import mongoose from "mongoose";


const TransactionSchema =  new  mongoose.Schema({
    user_id:{
        type:mongoose.Schema.ObjectId,
        required:true,
        ref:'users'
    },

    payment_intent_details:{
       type:Object,
        required:true  
    },

      transaction_status:{
       type:String,
       enum:['initialized','paid','failed','none'],
       default:'none'
    },


    amount:{
        type:mongoose.Schema.Types.Number,
        required:true  
    },

    group_id:{
      type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'groups'  
    },

     contribution_id:{
      type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'contributions'  
    },

},{timestamps:true})


export const transactionModel =  mongoose.model('transactions',TransactionSchema)