import Stripe from "stripe"
import SERVER_STATUS from "../../../../util/interface/CODE"
import TypedRequest from "../../../../util/interface/TypedRequest"
import TypedResponse from "../../../../util/interface/TypedResponse"
import PaymentGateWay from "../../paymentSetup"
import { transactionModel } from "../../model/transactionModel"
import { ContributionModel } from "../../../groups/model/contritubitions"
import { newAccountModel } from "../../../auth/account/model/createAccountModel"
import { newGroupModel } from "../../../groups/model/groups"
import { startContributionSchedule } from "../../../backgroundTask/contributionService"
import { BackgroundService } from "../../../backgroundTask/backgroundServiceClass"




export const getPaymentHookResponse = async (req:TypedRequest<any>,res:TypedResponse<any>) =>{

const payment = (await PaymentGateWay.getPaymentGateWayInstance()).stripeInstance()
  const secret = process.env.SECRET_HOOK_KEY!!
    try {
   
      

  let event:Stripe.Event;

  if (secret) {
    // Get the signature sent by Stripe
    const signature = req.headers['stripe-signature'];
  
      event = payment?.webhooks.constructEvent(
        req.body,
        signature!!,
        secret
      )!!;
    res.json({received: true});
      

  switch (event.type) {
   /* case 'payment_intent.succeeded':
   
      const paymentIntent = event.data.object;
      console.log(paymentIntent.client_secret)
      console.log(paymentIntent.metadata)

      

     const transaction = await  transactionModel.findOne({user_id:paymentIntent.metadata.member_id,group_id:paymentIntent.metadata.group_id})
    
     if(transaction && transaction.transaction_status !=='paid'){
        await transaction.updateOne({transaction_status:'paid'})

      const  contribution =  await ContributionModel.findOne({group_id:transaction.group_id})

        if(contribution){
            const members = contribution.members_paid
            members.push({
                payment_status:'paid',
                contributed_at:Date.now(),
                member_id:transaction.user_id,
                transactionDetails:transaction._id
            })
            await contribution.updateOne({members_paid:members})
            await transaction.updateOne(paymentIntent.metadata)
        }
     }
      // Then define and call a method to handle the successful payment intent.
      // handlePaymentIntentSucceeded(paymentIntent);
      break;
    case 'payment_method.attached':
      const paymentMethod = event.data.object;
      // Then define and call a method to handle the successful attachment of a PaymentMethod.
      // handlePaymentMethodAttached(paymentMethod);
      break;
    // ... handle other event types
     case 'transfer.created':{
       const jobScheduler = await (await BackgroundService.getInstance()).getJobSchedular()
       const paymentIntent = event.data.object;
      console.log(paymentIntent)

        const group = await newGroupModel.findOne({_id:paymentIntent.metadata.group_id})
        const contribution = await ContributionModel.findOne({_id:paymentIntent.metadata.contribution_id})
       
       if( group && contribution && group?.active_contribution_id.toString() === paymentIntent.metadata.contribution_id && group?.current_round === contribution?.current_round ){

          //try to automatically generate next round

          const updateRound = group.current_round+1

   if(group.max_number_of_members < updateRound){


   let nextPayoutDate = new Date(group.next_payout_date)

    if(group.frequency === 'hourly'){

        nextPayoutDate.setDate(nextPayoutDate.getHours() + 1)
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


    const nextContribution =  new ContributionModel({
          group_id:group._id,
       constribution_started:true,
        amount:group.contribution_amount,
        current_round:updateRound,
        member_due_for_payment:await getDueMemberForPayment(contribution,group)
            })



    await  nextContribution.save()

      await  group.updateOne({contribution_started:true,start_date:Date.now(),current_round:updateRound,next_payout_date:nextPayoutDate.toDateString(),active_contribution_id:nextContribution?._id})
      await contribution.updateOne({constribution_ended:true,processingPayment:false})
       await  jobScheduler?.cancel({'data.contribution_id':contribution._id.toString()!!})

        startContributionSchedule(nextContribution._id.toString('base64')!!,group._id.toString()!!,nextPayoutDate)
          


          }

        

  
     

       }

      return
     }

      case 'setup_intent.succeeded':{
     const setupIntent = event.data.object;

    // This is the ID you need for future "off-session" payments
    const paymentMethodId = setupIntent.payment_method;
    const customerId = setupIntent.customer;
     const user =  await newAccountModel.findOne({stripe_customer_id:customerId})
     if(user){
      await user.updateOne({stripe_connect_pm_id:paymentMethodId,stripe_process_completed:true})
      console.log('fully linked account.')
     }
     }

     case 'payout.paid':{
     
    
  // Track when funds actually clear the bank for the member
  if (event.type === 'payout.paid') {
    const payout = event.data.object;
    const accountId = event.account; // The ID of the sub-account receiving the payout
    console.log(`🏦 Bank confirmed payout for ${accountId}`);
  }
      return
     }
*/
     case "account.updated":{
      const account = event.data.object;
  
      if(account.charges_enabled && account.details_submitted){
         await newAccountModel.findOneAndUpdate({email:account.email},{stripe_connect_acc_id:account?.id})
        console.log(`Account  is now fully enabled for charges and transfers.`);
      }
      return
     }
    default:
      console.log(`Unhandled event type ${event.type}`);
  }
} 




    } catch (error:any) {
        
      if( error instanceof  Stripe.errors.StripeError){
       console.log(error.message)
        return
      }
     
        res.status(SERVER_STATUS.INTERNAL_SERVER_ERROR).json({
          title:'Update user details',
          successful:false,
          status:SERVER_STATUS.INTERNAL_SERVER_ERROR,
          message:'Invalid details.',
        
        })
      
    }
}


export const newAccountSetupHook = async (req:TypedRequest<any>,res:TypedResponse<any>) =>{

const payment = (await PaymentGateWay.getPaymentGateWayInstance()).stripeInstance()
   const secret = process.env.SECRET_HOOK_FOR_ACCOUNT_KEY!!
    try {
   
      

  let event:Stripe.Event;

  if (secret) {
    // Get the signature sent by Stripe
    const signature = req.headers['stripe-signature'];
  
      event = payment?.webhooks.constructEvent(
        req.body,
        signature!!,
        secret
      )!!;
    res.json({received: true});
      

  switch (event.type) {
    case 'payment_intent.succeeded':
   
      const paymentIntent = event.data.object;
      console.log(paymentIntent.client_secret)
      console.log(paymentIntent.metadata)

      

     const transaction = await  transactionModel.findOne({user_id:paymentIntent.metadata.member_id,group_id:paymentIntent.metadata.group_id})
    
     if(transaction && transaction.transaction_status !=='paid'){
        await transaction.updateOne({transaction_status:'paid'})

      const  contribution =  await ContributionModel.findOne({group_id:transaction.group_id})

        if(contribution){
            const members = contribution.members_paid
            members.push({
                payment_status:'paid',
                contributed_at:Date.now(),
                member_id:transaction.user_id,
                transactionDetails:transaction._id
            })
            await contribution.updateOne({members_paid:members})
            await transaction.updateOne(paymentIntent.metadata)
        }
     }
      // Then define and call a method to handle the successful payment intent.
      // handlePaymentIntentSucceeded(paymentIntent);
      break;
    case 'payment_method.attached':
      const paymentMethod = event.data.object;
      // Then define and call a method to handle the successful attachment of a PaymentMethod.
      // handlePaymentMethodAttached(paymentMethod);
      break;
    // ... handle other event types
     case 'transfer.created':{
       const jobScheduler = await (await BackgroundService.getInstance()).getJobSchedular()
       const paymentIntent = event.data.object;
      console.log(paymentIntent)

        const group = await newGroupModel.findOne({_id:paymentIntent.metadata.group_id})
        const contribution = await ContributionModel.findOne({_id:paymentIntent.metadata.contribution_id})
       
       if( group && contribution && group?.active_contribution_id.toString() === paymentIntent.metadata.contribution_id && group?.current_round === contribution?.current_round ){

          //try to automatically generate next round

          const updateRound = group.current_round+1

   if(group.max_number_of_members < updateRound){


   let nextPayoutDate = new Date(group.next_payout_date)

    if(group.frequency === 'hourly'){

        nextPayoutDate.setDate(nextPayoutDate.getHours() + 1)
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


    const nextContribution =  new ContributionModel({
          group_id:group._id,
       constribution_started:true,
        amount:group.contribution_amount,
        current_round:updateRound,
        member_due_for_payment:await getDueMemberForPayment(contribution,group)
            })



    await  nextContribution.save()

      await  group.updateOne({contribution_started:true,start_date:Date.now(),current_round:updateRound,next_payout_date:nextPayoutDate.toDateString(),active_contribution_id:nextContribution?._id})
      await contribution.updateOne({constribution_ended:true,processingPayment:false})
       await  jobScheduler?.cancel({'data.contribution_id':contribution._id.toString()!!})

        startContributionSchedule(nextContribution._id.toString('base64')!!,group._id.toString()!!,nextPayoutDate)
          


          }

        

  
     

       }

      return
     }

      case 'setup_intent.succeeded':{
     const setupIntent = event.data.object;

    // This is the ID you need for future "off-session" payments
    const paymentMethodId = setupIntent.payment_method;
    const customerId = setupIntent.customer;
     const user =  await newAccountModel.findOne({stripe_customer_id:customerId})
     if(user){
      await user.updateOne({stripe_connect_pm_id:paymentMethodId,stripe_process_completed:true})
      console.log('fully linked account.')
     }
     }

     case 'payout.paid':{
     
    
  // Track when funds actually clear the bank for the member
  if (event.type === 'payout.paid') {
    const payout = event.data.object;
    const accountId = event.account; // The ID of the sub-account receiving the payout
    console.log(`🏦 Bank confirmed payout for ${accountId}`);
  }
      return
     }

     case "account.updated":{
      const account = event.data.object;
  
      if(account.charges_enabled && account.details_submitted){
         await newAccountModel.findOneAndUpdate({email:account.email},{stripe_connect_acc_id:account?.id})
        console.log(`Account  is now fully enabled for charges and transfers.`);
      }
      return
     }
    default:
      console.log(`Unhandled event type ${event.type}`);
  }
} 




    } catch (error:any) {
        
      if( error instanceof  Stripe.errors.StripeError){
       console.log(error.message)
        return
      }
     
        res.status(SERVER_STATUS.INTERNAL_SERVER_ERROR).json({
          title:'Update user details',
          successful:false,
          status:SERVER_STATUS.INTERNAL_SERVER_ERROR,
          message:'Invalid details.',
        
        })
      
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