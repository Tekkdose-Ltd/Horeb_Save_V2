 import stripe, { Stripe } from 'stripe'
import { stringifyPrimitive } from 'zod/v4/core/util.cjs'

 class PaymentGateWay {

 private static paymentGateWayInstance?:PaymentGateWay = undefined

 private BASE_URL = ''

 private SECRET_KEY = process.env.TESTING_STRIPE_SECRET_KEY!!

 private stripe_instance?:Stripe = undefined
 

   private constructor () {

    this.stripe_instance = new stripe(this.SECRET_KEY)
     }



     auto_charge_user = async  (payment_method:any,amount:number,customerID:any,groupId:any,memberID:any,currentRound:any,description:any) =>{
     return this.stripe_instance?.paymentIntents.create({
  amount:Math.round(amount * 100),
  currency: 'usd',
  customer: customerID,
  payment_method: payment_method,
  payment_method_types: ['card'], 
  
  off_session: true,
  confirm: true,
  
  // 2. This will now work without the error
  error_on_requires_action: true,

   metadata: {
    group_id: groupId.toString(),
    member_id: memberID.toString(),
    round_number: currentRound,
    contribution_type: description,
    internal_reference: `REF-${Date.now()}`
  }
});
     }



     create_payment_intent = async (customer:string,amount:number,currency:string) =>{
        
     return  await this.stripe_instance?.paymentIntents.create(
        {
            amount,
            currency
            
          
        }
       )
     }


     
      send_money_to_due_user = async (dueMember:string,amount:number,currency:string,group_id:any,member_id:any,contribution_id:any) =>{
         const transfer = await this.stripe_instance?.transfers.create({
            amount: Math.round(amount * 100),
            currency: 'usd',
            destination: dueMember,
            
            metadata:{
             group_id,
             member_id,
             contribution_id
            }
        });

        return await this.stripe_instance?.payouts.create({
            amount: transfer?.amount!!,
            currency: 'usd',
        }, {
            stripeAccount: dueMember,
        });
       
      }



     create_stripe_account_for_new_member = async (email:any,name:any)=>{
    return await this.stripeInstance()?.customers.create({
      email,
      name,
    
    })


       }


      create_stripe_express_account_for_new_member = async (email:any)=>{
    const account = await this.stripeInstance()?.accounts.create({
      type:'express',
      capabilities:{
        transfers:{requested:true}
      },
      email,
      
      
    })

    

      return account
       }




       link_account_for_payment = async (accountId:any) =>{
      const acccountLink = await  this.stripeInstance()?.accountLinks.create({
      account:accountId,
      refresh_url:'http://localhost:3050/api/v1/refresh',
      return_url:'http://localhost:3050/api/v1/completed',
      type:'account_onboarding'
     })

     return acccountLink

       }



      contritube_to_group_payment_setUp = async (customerID:any) =>{
       
        const result = await this.stripeInstance()?.setupIntents.create({
           
            customer:customerID,
            payment_method_types:['card'],
            usage:'off_session'
          })
          

          return  result
      }


      
      stripeInstance  = () =>{
        return this.stripe_instance
      }


      

  



     public static getPaymentGateWayInstance = async ():Promise<PaymentGateWay> => {



          if(!this.paymentGateWayInstance){

        const instance =  await new Promise<PaymentGateWay>((resolve,reject)=>{
            resolve(new PaymentGateWay())
         })
          this.paymentGateWayInstance = instance
         return  this.paymentGateWayInstance
         
        }
    
        return this.paymentGateWayInstance
       
           
     
     
     }
}

export default PaymentGateWay