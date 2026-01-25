import SERVER_STATUS from "../../../util/interface/CODE";
import { ResponseBodyProps } from "../../../util/interface/ResponseBodyProps";
import TypedRequest from "../../../util/interface/TypedRequest";
import TypedResponse from "../../../util/interface/TypedResponse";
import { newAccountModel } from "../../auth/account/model/createAccountModel";
import { transactionModel } from "../model/transactionModel";
import PaymentGateWay from "../paymentSetup";

export const getMyTransactions = async (req:TypedRequest<any>,res:TypedResponse<ResponseBodyProps>) =>{

    const user = req.user 

    try {
        
      const userDetails = await newAccountModel.findOne({_id:user._id})

      if(userDetails){

        const myTransactions = await transactionModel.find({user_id:userDetails._id})

        if(myTransactions){
           res.status(SERVER_STATUS.SUCCESS).json({
                 title:'User Transaction details',
                 successful:true,
                 status:SERVER_STATUS.SUCCESS,
                 message:'Transaction fetched successfully',
                data:myTransactions
               })

        }else{
          res.status(SERVER_STATUS.SUCCESS).json({
                 title:'User Transaction details',
                 successful:true,
                 status:SERVER_STATUS.SUCCESS,
                 message:'No transaction yet.',
               
               })
        }

        return
      }

         res.status(SERVER_STATUS.Forbidden).json({
                 title:'User Transaction details',
                 successful:false,
                 status:SERVER_STATUS.Forbidden,
                 message:'Forbidden.',
               
               })

    } catch (error) {
        
    }

}


export const  createNewAndLinKAccount = async (req:TypedRequest<any>,res:TypedResponse<ResponseBodyProps>) =>{


  try {

    const userData = await newAccountModel.findOne({_id:req.user._id})
     if(userData?.stripe_connect_acc_id){

       res.status(SERVER_STATUS.BAD_REQUEST).json({
                 title:'User Link Payment Account Message',
                 successful:false,
                 status:SERVER_STATUS.BAD_REQUEST,
                 message:'Account already linked',
               
               
               })

               return

     }

     const payment = await PaymentGateWay.getPaymentGateWayInstance()
     const account = await  payment.create_stripe_express_account_for_new_member(userData?.email)

    

     const redirectURL = await payment.link_account_for_payment(account?.id)
     console.log('calle.....')
   console.log(redirectURL)
      if(redirectURL?.url){

        await userData?.updateOne({stripe_connect_acc_id:account?.id})
               res.status(SERVER_STATUS.SUCCESS).json({
                 title:'User Link Payment Account Message',
                 successful:true,
                 status:SERVER_STATUS.SUCCESS,
                 message:'Account link url generated',
                data:{redirectURL:redirectURL?.url}
               
               })

               return
      }

  res.status(SERVER_STATUS.INTERNAL_SERVER_ERROR).json({
                 title:'User Link Payment Account Message',
                 successful:false,
                 status:SERVER_STATUS.INTERNAL_SERVER_ERROR,
                 message:'Account link url failed',
            
               
               })


    
  } catch (error:any) {
    
       res.status(SERVER_STATUS.INTERNAL_SERVER_ERROR).json({
                 title:'User Link Payment Account Message',
                 successful:false,
                 status:SERVER_STATUS.INTERNAL_SERVER_ERROR,
                 message:'Server Error',
                 error:error.message
               
               })
  }
  

   
}