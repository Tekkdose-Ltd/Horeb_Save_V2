import SERVER_STATUS from "../../../util/interface/CODE";
import { ResponseBodyProps } from "../../../util/interface/ResponseBodyProps";
import TypedRequest from "../../../util/interface/TypedRequest";
import TypedResponse from "../../../util/interface/TypedResponse";
import { USER_ROLES } from "../../../util/interface/UserRole";
import { newWaitlistModel } from "../model/waitlist";



export const newWaitlist = async (req:TypedRequest<{
    first_name:string,
    last_name:string,
    email:string,
    phone_number:string,
    saving_method:string,
    income_pattern:string,
    priority:string,
    goal:string,
    early_access:string
}>,res:TypedResponse<ResponseBodyProps>) =>  {

    try {


        const newWaitlist =  new newWaitlistModel(req.body)

        await newWaitlist.save()

       res.status(SERVER_STATUS.CREATED).json({
        title:'Waitlist  Message',
        status:SERVER_STATUS.CREATED,
        successful:true,
        message:"Waitlist created.",
     
      })


        
    } catch (error:any) {

       res.status(SERVER_STATUS.INTERNAL_SERVER_ERROR).json({
                title:'Waitlist   Message',
                status:SERVER_STATUS.INTERNAL_SERVER_ERROR,
                successful:false,
                message:"An error occured.",
                error:error.message
             
              })
        
    }

}


export const getAllWaitList = async (req:TypedRequest<any>,res:TypedResponse<ResponseBodyProps>)=>{

    try {

        const user = req.user

        if(user.role === USER_ROLES.ADMIN){

            const waitlist = await  newWaitlistModel.find()


             res.status(SERVER_STATUS.SUCCESS).json({
                title:'Waitlist   Message',
                status:SERVER_STATUS.SUCCESS,
                successful:true,
                message:"Waitlist Successfully fetched.",
                data:waitlist
             
              })

        }else{


             res.status(SERVER_STATUS.UNAUTHORIZED).json({
                title:'Waitlist   Message',
                status:SERVER_STATUS.UNAUTHORIZED,
                successful:false,
                message:"UnAuthorized access.",
               
             
              })
            
        }
        
    } catch (error:any) {
        res.status(SERVER_STATUS.INTERNAL_SERVER_ERROR).json({
                title:'Waitlist   Message',
                status:SERVER_STATUS.INTERNAL_SERVER_ERROR,
                successful:false,
                message:"An error occured.",
                error:error.message
             
              })
    }

}