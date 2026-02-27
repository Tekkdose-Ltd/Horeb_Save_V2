import { newAccountModel } from "../auth/account/model/createAccountModel"
import { ContributionModel } from "../groups/model/contritubitions"
import { newGroupModel } from "../groups/model/groups"
import PaymentGateWay from "../payment/paymentSetup"
import { BackgroundService } from "./backgroundServiceClass"
import {Agenda} from 'agenda'

export const startContributionSchedule = async (contribution_id:string,group_id:string,dueDate:Date) =>{
 
    const jobScheduler = await (await BackgroundService.getInstance()).getJobSchedular()

    try {
        
   
 
      console.log('starete')

      const job = jobScheduler?.create('process-contribution', {
    contribution_id,
    group_id,
    dueDate
  });

  // Use unique() to prevent duplicate jobs for the same contribution ID
  job!!.unique({ 'data.contribution_id': contribution_id });

  // Schedule it for your specific date
 job?.repeatEvery('10 seconds');
 
  await job!!.save();
 


    
}catch (error) {


        
    }
}


export const checkDueContribution  = async (contribution_id:string,group_id:string,jobScheduler:Agenda) =>{
     
    try {
       console.log('background calling.....',contribution_id)
     
        const contribution = await ContributionModel.findOne({_id:contribution_id,group_id:group_id})

        const group = await newGroupModel.findOne({_id:group_id,active_contribution_id:contribution_id})
         const user = await newAccountModel.findOne({id:contribution?.member_due_for_payment})
       
       
         if(contribution && group && contribution.members_paid.length === group.max_number_of_members && !contribution.member_completed_payment && !contribution.constribution_ended){
             await contribution.updateOne({member_completed_payment:true})
         }

         if(contribution && contribution.member_completed_payment && group && new Date(group.next_payout_date).getTime()=== Date.now() && !contribution.processingPayment){
         

          (await PaymentGateWay.getPaymentGateWayInstance()).send_money_to_due_user(user?._id.toString()!!,group.contribution_amount,'usd',group._id,contribution.member_due_for_payment,contribution._id)

           await  contribution.updateOne({processingPayment:true})
            // send email to admin to pay out
         }



     const paymentApprovalForContributions = group?.admin_payment_approval!!

    const paymentDisbursedForContribution =  paymentApprovalForContributions.find(approval=>approval.group_id.toString()===group_id && approval.current_round=== contribution?.current_round)




      if(contribution?.member_completed_payment && paymentDisbursedForContribution && group?.active_contribution_id.toString('base64') === contribution_id && group?.current_round !== contribution?.current_round  ){
       await  jobScheduler.cancel({'data.contribution_id':contribution_id})
        return
      }


      
            if(contribution && group ){


            // send email to admin to pay out
         }



    } catch (error) {
        
    }

}


const getDueMemberForPayment = async (contribution:any,group:any) =>{


   const lastPaidMember = group.members.find((member:any)=>member.id === contribution.member_due_for_payment)

      const nextRandomNumber = await generateRandomNumber(1,group.members.length,lastPaidMember)

    return group.members[nextRandomNumber].id

}


const generateRandomNumber = async (min:number,max:number,prevNumber:number) : Promise<number> => {
   const number = Math.floor(Math.random() * (max - min + 1)) + min;
    while(number >= max && number === prevNumber){
      generateRandomNumber(min,max,prevNumber)
    }
    return number
}