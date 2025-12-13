 import stripe, { Stripe } from 'stripe'

 class PaymentGateWay {

 private static paymentGateWayInstance?:PaymentGateWay = undefined

 private BASE_URL = ''

 private SECRET_KEY = process.env.TESTING_STRIPE_SECRET_KEY!!

 private stripe_instance?:Stripe = undefined
 

   private constructor () {
    this.stripe_instance = new stripe(this.SECRET_KEY)
     }

     create_payment_intent = async (customer:string,amount:number,currency:string) =>{
        
     return  await this.stripe_instance?.paymentIntents.create(
        {
            amount,
            currency
            
          
        }
       )
     }

   
      
      

    initPayment = async () =>{

     return    await this.stripe_instance?.checkout.sessions.create({
            mode:'payment',
            line_items:[
                {
                   price_data:{
                    currency:'NGN',
                    unit_amount:4000,
                
                   },
                   quantity:1
                    
                }
            ],
            success_url:`http://localhost:3050/webhook/payment/response?sessionId={CHECKOUT_SESSION_ID}`,
            cancel_url:`http://localhost:3050/webhook/payment/canceled`
        })
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