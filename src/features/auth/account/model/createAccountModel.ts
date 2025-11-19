import mongoose from 'mongoose'

const NewAccountSchema = new mongoose.Schema({
   email:{
    type:mongoose.Schema.Types.String
   },
    first_name:{
    type:mongoose.Schema.Types.String
   },
    last_name:{
    type:mongoose.Schema.Types.String
   },
    profile_image_url:{
    type:mongoose.Schema.Types.String
   },
    phone_number:{
    type:mongoose.Schema.Types.String
   },
    date_of_birth:{
    type:mongoose.Schema.Types.Date
   },
    address_line_1:{
    type:mongoose.Schema.Types.String
   },
    address_line_2:{
    type:mongoose.Schema.Types.String
   },
    city:{
    type:mongoose.Schema.Types.String
   },
    postalCode:{
    type:mongoose.Schema.Types.String
   },
    country:{
    type:mongoose.Schema.Types.String
   },
    profile_completed:{
    type:mongoose.Schema.Types.Boolean
   },
    stripe_customer_id:{
    type:mongoose.Schema.Types.String
   },
    trust_score:{
    type:mongoose.Schema.Types.Number
   },
    total_groups_completed:{
    type:mongoose.Schema.Types.Number
   },
    on_time_payment_rate:{
    type:mongoose.Schema.Types.Number
   }
})


export   const newAccountModel = mongoose.model('users',NewAccountSchema)