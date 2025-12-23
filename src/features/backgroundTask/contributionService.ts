import { ContributionModel } from "../groups/model/contritubitions"
import { newGroupModel } from "../groups/model/groups"
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
       console.log('background calling.....')
        const contribution = await ContributionModel.findOne({_id:contribution_id,group_id:group_id})

        const group = await newGroupModel.findOne({_id:group_id,active_contribution_id:contribution_id})

         if(contribution && group && contribution.members_paid.length === group.max_number_of_members){
             await contribution.updateOne({member_completed_payment:true})
         }

         if(contribution && contribution.member_completed_payment && group && new Date(group.next_payout_date).getTime()=== Date.now()){
            // send email to admin to pay out
         }



     const paymentApprovalForContributions = group?.admin_payment_approval!!

    const paymentDisbursedForContribution =  paymentApprovalForContributions.find(approval=>approval.group_id.toString()===group_id && approval.current_round=== contribution?.current_round)


       if(paymentDisbursedForContribution && group?.active_contribution_id.toString() === contribution_id && group?.current_round === contribution?.current_round ){

          //try to automatically generate next round

          const updateRound = group.current_round+1

   if(group.max_number_of_members < updateRound){


   let nextPayoutDate = new Date(group.next_payout_date)

    if(group.frequency === 'weekly'){

        nextPayoutDate.setDate(nextPayoutDate.getDate() + 7)
    }

       else if(group.frequency === 'bi-weekly'){
        nextPayoutDate.setDate(nextPayoutDate.getDate() + 14)
    }
    else if(group.frequency === 'monthly'){
        nextPayoutDate.setMonth(nextPayoutDate.getMonth() + 1)
    }


    const nextContribution =  new ContributionModel({
          group_id:group._id,
       constribution_started:true,
        amount:group.contribution_amount,
        current_round:updateRound,
        member_due_for_payment:await getDueMemberForPayment(contribution,group)
            })



    await  nextContribution.save()

      await  group.updateOne({contribution_started:true,start_date:Date.now(),current_round:updateRound,next_payout_date:nextPayoutDate.toDateString(),active_contribution_id:nextContribution?._id})
      await contribution.updateOne({constribution_ended:true})
       await  jobScheduler.cancel({'data.contribution_id':contribution_id})

        startContributionSchedule(nextContribution._id.toString('base64')!!,group_id,nextPayoutDate)
          


          }

        

  
     

       }



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