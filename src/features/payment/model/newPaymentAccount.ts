import mongoose from "mongoose";

const  PaymentAccountSchema = new mongoose.Schema({
    account_id:{type:mongoose.Schema.Types.String},
    user:{type:mongoose.Schema.Types.ObjectId,ref:'users'},
    

})

export const  newPaymentAccount = mongoose.model('payment_account',PaymentAccountSchema)


