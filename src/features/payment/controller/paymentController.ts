import SERVER_STATUS from "../../../util/interface/CODE";
import { ResponseBodyProps } from "../../../util/interface/ResponseBodyProps";
import TypedRequest from "../../../util/interface/TypedRequest";
import TypedResponse from "../../../util/interface/TypedResponse";
import { newAccountModel } from "../../auth/account/model/createAccountModel";
import { transactionModel } from "../model/transactionModel";

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