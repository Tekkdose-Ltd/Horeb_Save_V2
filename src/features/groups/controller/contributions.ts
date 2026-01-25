import { countryCurrency } from "../../../util/countryCurrency"
import SERVER_STATUS from "../../../util/interface/CODE"
import { ResponseBodyProps } from "../../../util/interface/ResponseBodyProps"
import TypedRequest from "../../../util/interface/TypedRequest"
import TypedResponse from "../../../util/interface/TypedResponse"
import { newAccountModel } from "../../auth/account/model/createAccountModel"
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

      let membersDetails:any[] = []
   
       for (const member of group.members){
           membersDetails.push(await newAccountModel.findOne({_id:member.id}))
       }
       const memberDetailsInvalid = membersDetails?.filter((member)=>{
        return !member?.stripe_connect_acc_id || !member?.stripe_customer_id
       })
       if(memberDetailsInvalid){

          return res.status(SERVER_STATUS.UNAUTHORIZED).json({
                title:'Start Group Contribution Message',
                status:SERVER_STATUS.UNAUTHORIZED,
                successful:false,
                message:'Group member details for payment not complete.'
            })

       }

    //update next payout date based on frequency
    let nextPayoutDate = new Date()

       if(group.frequency === 'hourly'){

        nextPayoutDate.setDate(nextPayoutDate.getHours()+1)
    }

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


//stimulate withdraw Peocess
   

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
        member_due_for_payment:group.members[generateRandomNumber(0,group.members.length)].id
     }).save()

  await  group.updateOne({contribution_started:true,start_date:Date.now(),current_round:1,next_payout_date:nextPayoutDate.toDateString(),active_contribution_id:newConstribution?._id})




let results = await attemptGroupCharge(membersDetails, group.contribution_amount,group._id,1,group.name);
let successfulOnes = results.filter(r => r.success);


if (successfulOnes.length !== membersDetails.length) {
    const failedMemberIds = results.filter(r => !r.success).map(r => r.memberId);
    const failedMembersDetails = membersDetails.filter(m => failedMemberIds.includes(m._id));
    
    console.log(`Retrying ${failedMembersDetails.length} failed charges...`);
    const retryResults = await attemptGroupCharge(failedMembersDetails, group.contribution_amount,group._id,1,group.name);
    

    successfulOnes = [...successfulOnes, ...retryResults.filter(r => r.success)];
}



if (successfulOnes.length === membersDetails.length) {
    
    const winnerIndex = Math.floor(Math.random() * group.members.length);
    const memberDueForPayment = group.members[winnerIndex].id;

    

  

  
  console.log('called...') 
  await startContributionSchedule(newConstribution._id.toString(),group._id.toString(),nextPayoutDate)
       
  res.status(SERVER_STATUS.SUCCESS).json({
            title:'Start Group Contribution Message',
            status:SERVER_STATUS.SUCCESS,
            successful:true,
            message:'Group contribution started successfully.'
        })

    }

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


export const linkCardForPayment = async (req:TypedRequest<{group_id:string,amount:number,member_id:string}>,res:TypedResponse<ResponseBodyProps>) =>{

    const user = req.user
    const {group_id,member_id,amount} = req.body


    try{

        const group = await newGroupModel.findOne({_id:group_id,'members.id':member_id})
       

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

const userData = await newAccountModel.findOne({_id:user._id})
      //init payment for contribution 

   const payment = await PaymentGateWay.getPaymentGateWayInstance()
   const currency =  await getCountryCurreny(user.country)
   if(!currency) throw('No currency provided.')

    let customerID = ''

    if(!userData?.stripe_customer_id){
        const customer = await payment.create_stripe_account_for_new_member(userData?.email,userData?.first_name)
          customerID = customer?.id!!
        await userData?.updateOne({stripe_customer_id:customer?.id!!})

    }else{
        customerID = userData?.stripe_customer_id
    }
   
   const paymentDetails = await payment.contritube_to_group_payment_setUp(userData?.stripe_customer_id??customerID)

   await new transactionModel({
    user_id:member_id,
    customer_id:customerID,
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

const getCountryCurreny =  async (country:string) =>{

    let currency = ''
                
                for (const data of countryCurrency){
                   const item = data.countries.find(country=> country ==="Nigeria")
                   if(item){
                    currency = data.currency_code
                    break
                   }
                }
    
               return currency
}



const attemptGroupCharge = async (members: any[], amount: number,group_id:any,current_round:any,description:any) => {
    const gateway = await PaymentGateWay.getPaymentGateWayInstance();
    
    
    const chargeTasks = members.map(async (member) => {
        try {
            const result = await gateway.auto_charge_user(
                member.stripe_connect_pm_id,
                amount,
                member.stripe_customer_id,
                member._id,
                group_id,
                current_round,
                description
            );
            return { memberId: member._id, status: result?.status, success: result?.status === 'succeeded' };
        } catch (error: any) {
            return { memberId: member._id, status: 'failed', success: false, error: error.message };
        }
    });

    return await Promise.all(chargeTasks); // Use all for predictable mapping
};