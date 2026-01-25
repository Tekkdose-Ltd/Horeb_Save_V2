import mongoose from "mongoose";



const groupSchema = new mongoose.Schema({
    
    name:{
     type:mongoose.SchemaTypes.String,
     required:[true,'creator of group must be provided'],
     unique:[true,'Name already used please provide another name.']
    },


    description:{
      type:mongoose.SchemaTypes.String,
    },

    creator_id:{
      type:mongoose.Schema.ObjectId,
        required:[true,'creator of group must be provided'],
        ref:'users'
    },

      frequency:{
      type:mongoose.SchemaTypes.String,
      enum:['hourly','weekly','monthly','bi-weekly']
    },

    contribution_amount:{
    type:mongoose.SchemaTypes.Number,
    default:0
    },

     current_round:{
        type:mongoose.SchemaTypes.Number,
        default:0
     },

     total_round:{
        type:mongoose.SchemaTypes.Number,
        default:0
     },

    
   active_contribution_id:{
     type:mongoose.SchemaTypes.ObjectId,
     default:null
     },

     next_payout_date:{
     type:mongoose.SchemaTypes.String,
     default:null
     },

     start_date:{
     type:mongoose.SchemaTypes.Date,
     default:null
     },

     completed_at:{
       type:mongoose.SchemaTypes.String,
     default:null 
     },

     invite_code:{
        type:mongoose.SchemaTypes.String, 
     },

     is_public:{
        type:mongoose.SchemaTypes.Boolean, 
        default:true
     },
    

  

    members:[{
       id:{
          type:mongoose.Schema.ObjectId,
        required:[true,'creator of group must be provided'],
        ref:'users'
       },
       isAdmin:{
        type:mongoose.Schema.Types.Boolean,
        default:false
       },
       joined_at:{
         type:mongoose.Schema.Types.Date,
         default:Date.now()

       },
       payout_order:{
         type:mongoose.Schema.Types.Number,
         default:0
       },

       has_received_payout:{
         type:mongoose.Schema.Types.Boolean,
        default:false
       },
       payout_received_at:{
          type:mongoose.Schema.Types.Date,
         default:null
       },
       trust_rating:{

       },
       is_active:{
        type:mongoose.Schema.Types.Boolean,
        default:true
       }

    }],

    groupInviteLink:{
        type:String,
        
    },

    group_status:{
        type:String,
        enum:['draft', 'active', 'completed', 'cancelled'],
        default:'active'
    },

    max_number_of_members:{
       type:mongoose.SchemaTypes.Number,
     default:0
    },

    admin_payment_approval:[{
       group_id:{
        
        type:mongoose.SchemaTypes.ObjectId,
     default:null
     },
     contribution_id:{
        
        type:mongoose.SchemaTypes.ObjectId,
     default:null
     },
       current_round:{
        
        type:Number,
     default:null
     },
     active_contribution_url:{
      type:mongoose.SchemaTypes.ObjectId,
     default:null
     },
     transactions:[{
    type:mongoose.SchemaTypes.ObjectId,
     default:null
     }]

    }],

    circles_completed:{
    type:mongoose.SchemaTypes.Number,
     default:0
    }

},{timestamps:true})


export const newGroupModel = mongoose.model('groups',groupSchema)