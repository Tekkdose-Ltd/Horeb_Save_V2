import SERVER_STATUS from "../../../../util/interface/CODE";
import { ResponseBodyProps } from "../../../../util/interface/ResponseBodyProps";
import TypedRequest from "../../../../util/interface/TypedRequest";
import TypedResponse from "../../../../util/interface/TypedResponse";
import { newAccountModel } from "../model/createAccountModel";
import passwordHasher from 'bcryptjs'
import jwt from 'jsonwebtoken'

type NewAccount = {
 email:string,
  password:string,
    first_name:string,
    last_name:string,
    profile_image_url:string,
    phone_number:string,
    date_of_birth:Date,
    address_line_1:string,
    address_line_2:string,
    city:string,
    postalCode:string,
    country:string,
    profile_completed:boolean,
    stripe_customer_id:string,
    trust_score:number,
    total_groups_completed:number,
    on_time_payment_rate:number
}

export const createNewAccount = async (req:TypedRequest<NewAccount>,res:TypedResponse<ResponseBodyProps>) => {


    try{

  /**
         * check if account already created with same email
         */
    
        const accountAlreadyCreated = await newAccountModel.findOne({email:req.body.email})
    
        if(accountAlreadyCreated){
    
            res.status(SERVER_STATUS.BAD_REQUEST).json({
                title:'New Account Message',
                status:SERVER_STATUS.BAD_REQUEST,
                successful:false,
                message:'Account already created.'
            })
    
            return
    
        }
    
        /**
         * check if password follows the right standard alphanumeric characters
         */
    
        if(!(/^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/.test(
            req.body.password
          ))){
    
            res.status(SERVER_STATUS.BAD_REQUEST).json({
                title:'New Account Message',
                status:SERVER_STATUS.BAD_REQUEST,
                successful:false,
                message:'password must contain atleast aphanumeric characters and symbols .'
            })
    
            return
          }

         const salt = await passwordHasher.genSalt(10)

         const hashedPassword  = passwordHasher.hash(req.body.password,salt)


     const newAccount = new newAccountModel({
        ...req.body,
        password:hashedPassword
     })

      await newAccount.save()

      const token = jwt.sign({email:req.body.email,first_name:req.body.first_name,last_name:req.body.last_name},process?.env?.APP_SECRET_TOKEN_SIGNER_KEY!!)

      res.status(SERVER_STATUS.CREATED).json({
        title:'Create New Account Message',
        status:SERVER_STATUS.CREATED,
        successful:true,
        message:"New Account Created Successfully !!!!",
        data:{
         
        token,

        }
      })
     
    
    }catch(e:any){

   res.status(SERVER_STATUS.BAD_REQUEST).json({
        title:'Create New Account Message',
        status:SERVER_STATUS.BAD_REQUEST,
        successful:false,
        message:"New Account creation failed",
        error:e.message
      })
        
    }



}
