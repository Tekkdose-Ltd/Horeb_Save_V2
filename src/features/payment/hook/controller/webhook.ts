import Stripe from "stripe"
import SERVER_STATUS from "../../../../util/interface/CODE"
import TypedRequest from "../../../../util/interface/TypedRequest"
import TypedResponse from "../../../../util/interface/TypedResponse"
import PaymentGateWay from "../../paymentSetup"
import { transactionModel } from "../../model/transactionModel"
import { ContributionModel } from "../../../groups/model/contritubitions"




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
    case 'payment_intent.succeeded':
   
      const paymentIntent = event.data.object;
      console.log(paymentIntent.client_secret)

     const transaction = await  transactionModel.findOne({'payment_intent_details.client_secret':paymentIntent.client_secret})
    
     if(transaction && transaction.transaction_status !=='paid'){
        await transaction.updateOne({transaction_status:'paid'})

      const  contribution =  await ContributionModel.findOneAndUpdate({_id:transaction?.contribution_id})

        if(contribution){
            const members = contribution.members_paid
            members.push({
                payment_status:'paid',
                contributed_at:Date.now(),
                member_id:transaction.user_id,
                transactionDetails:transaction._id
            })
            await contribution.updateOne({members_paid:members})
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
