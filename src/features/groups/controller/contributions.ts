import SERVER_STATUS from "../../../util/interface/CODE"
import { ResponseBodyProps } from "../../../util/interface/ResponseBodyProps"
import TypedRequest from "../../../util/interface/TypedRequest"
import TypedResponse from "../../../util/interface/TypedResponse"
import { startContributionSchedule } from "../../backgroundTask/contributionService"
import { transactionModel } from "../../payment/model/transactionModel"
import PaymentGateWay from "../../payment/paymentSetup"
import { ContributionModel } from "../model/contritubitions"
import { newGroupModel } from "../model/groups"





export const startGroupContribution = async (req:TypedRequest<{group_id:string,creator_of_group_id:string}>,res:TypedResponse<ResponseBodyProps>) =>{

    const user = req.user
    const {group_id,creator_of_group_id} = req.body

    try{

        const group = await newGroupModel.findOne({_id:group_id,creator_id:creator_of_group_id})

        if(!group){
            return res.status(SERVER_STATUS.BAD_REQUEST).json({
                title:'Start Group Contribution Message',
                status:SERVER_STATUS.BAD_REQUEST,
                successful:false,
                message:'Group not found.'
            })
        }

        if(group.creator_id.toString() !== user?._id.toString()){
            return res.status(SERVER_STATUS.UNAUTHORIZED).json({
                title:'Start Group Contribution Message',
                status:SERVER_STATUS.UNAUTHORIZED,
                successful:false,
                message:'Only group creator can start contribution.'
            })
        }

      if(group.members.length < group.max_number_of_members){
        return res.status(SERVER_STATUS.UNAUTHORIZED).json({
                title:'Start Group Contribution Message',
                status:SERVER_STATUS.UNAUTHORIZED,
                successful:false,
                message:'Group not complete yet. You can not start contribution.'
            })
      }
   
    //update next payout date based on frequency
    let nextPayoutDate = new Date()
    if(group.frequency === 'weekly'){

        nextPayoutDate.setDate(nextPayoutDate.getDate() + 7)
    }


    else if(group.frequency === 'bi-weekly'){
        nextPayoutDate.setDate(nextPayoutDate.getDate() + 14)
    }
    else if(group.frequency === 'monthly'){
        nextPayoutDate.setMonth(nextPayoutDate.getMonth() + 1)
    }

        //initialize contrtibution document for the group
const contribution = await ContributionModel.findOne({group_id:group._id})

   



if(contribution){

    return res.status(SERVER_STATUS.BAD_REQUEST).json({
        title:'Start Group Contribution Message',
        status:SERVER_STATUS.BAD_REQUEST,
        successful:false,
        message:'Group contribution already started.'
    })
}

  

   const newConstribution =  await new ContributionModel({
        group_id:group._id,
        constribution_started:true,
        amount:group.contribution_amount,
        current_round:1,
        member_due_for_payment:group.members[await generateRandomNumber(0,group.members.length)].id
     }).save()

  await  group.updateOne({contribution_started:true,start_date:Date.now(),current_round:1,next_payout_date:nextPayoutDate.toDateString(),active_contribution_id:newConstribution?._id})


  console.log('called...') 
  await startContributionSchedule(newConstribution._id.toString(),group._id.toString(),nextPayoutDate)
       
  res.status(SERVER_STATUS.SUCCESS).json({
            title:'Start Group Contribution Message',
            status:SERVER_STATUS.SUCCESS,
            successful:true,
            message:'Group contribution started successfully.'
        })

    }
    catch(error:any){
       
        res.status(SERVER_STATUS.INTERNAL_SERVER_ERROR).json({
            title:'Start Group Contribution Message',
            status:SERVER_STATUS.INTERNAL_SERVER_ERROR,
            successful:false,
            message:'Internal server error.',
            error:error.message
        })
    }

}


export const contributeToGroup = async (req:TypedRequest<{group_id:string,amount:number,member_id:string}>,res:TypedResponse<ResponseBodyProps>) =>{

    const user = req.user
    const {group_id,member_id,amount} = req.body


    try{

        const group = await newGroupModel.findOne({_id:group_id,'members.id':member_id})
      //  const userData = await newAccountModel.findOne({_id:user._id})

        if(!group){
            return res.status(SERVER_STATUS.BAD_REQUEST).json({
                title:'Group Contribution Message',
                status:SERVER_STATUS.BAD_REQUEST,
                successful:false,
                message:'Group not found.'
            })
        }

        if(group.contribution_amount  !== amount){
        
            return res.status(SERVER_STATUS.BAD_REQUEST).json({
                title:'Group Contribution Message',
                status:SERVER_STATUS.BAD_REQUEST,
                successful:false,
                message:'Invalid Amount.'
            })  
        }

         if(!group.active_contribution_id){
            return res.status(SERVER_STATUS.BAD_REQUEST).json({
                title:'Group Contribution Message',
                status:SERVER_STATUS.BAD_REQUEST,
                successful:false,
                message:'Contribution not started yet..'
            })
        }

   const contribution = await ContributionModel.findOne({group_id:group_id,_id:group.active_contribution_id})

    if(contribution?.members_paid.length=== group.members.length){
         return res.status(SERVER_STATUS.BAD_REQUEST).json({
                title:'Group Contribution Message',
                status:SERVER_STATUS.BAD_REQUEST,
                successful:false,
                message:'Payment already made wait for next round.'
            })
    }

 const memberAlreadyPaid =  contribution?.members_paid.find(data=>data.member_id?.toString('base64') === member_id)

 if(memberAlreadyPaid){
        return res.status(SERVER_STATUS.BAD_REQUEST).json({
                title:'Group Contribution Message',
                status:SERVER_STATUS.BAD_REQUEST,
                successful:false,
                message:'Payment already made wait for next round.'
            })
 }


      //init payment for contribution 

   const payment = await PaymentGateWay.getPaymentGateWayInstance()


   const paymentDetails = await payment.create_payment_intent('',amount,'usd')

   await new transactionModel({
    user_id:member_id,
    contribution_id:contribution?._id,
    group_id:group._id,
    transaction_status:'initialized',
    payment_intent_details:paymentDetails,
    amount
   }).save()

        return res.status(SERVER_STATUS.SUCCESS).json({
                title:'Group Contribution Message',
                status:SERVER_STATUS.SUCCESS,
                successful:false,
                message:'Payment initialized.',
                data:{
                    client_secret:paymentDetails?.client_secret
                }
            })
       

    }
    catch(error:any){
       
        res.status(SERVER_STATUS.INTERNAL_SERVER_ERROR).json({
            title:'Group Contribution Message',
            status:SERVER_STATUS.INTERNAL_SERVER_ERROR,
            successful:false,
            message:'Internal server error.',
            error:error.message
        })
    }

}




const getDueMemberForPayment = async (groupId:string,currentRound:number) =>{

    const group = await newGroupModel.findById(groupId)

    if(!group){
        throw new Error('Group not found.')
    }

    const numberOfMembers = group.members.length

    const dueMemberIndex = (currentRound -1) % numberOfMembers

    return group.members[dueMemberIndex].id

}

const generateRandomNumber = (min:number,max:number) : number => {
   const number = Math.floor(Math.random() * (max - min + 1)) + min;
    while(number >= max){
      generateRandomNumber(min,max)
    }
    return number
}