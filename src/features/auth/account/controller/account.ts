import { v4 } from "uuid";
import sendMail from "../../../../config/mail/nodeMailer";
import SERVER_STATUS from "../../../../util/interface/CODE";
import { ResponseBodyProps } from "../../../../util/interface/ResponseBodyProps";
import TypedRequest from "../../../../util/interface/TypedRequest";
import TypedResponse from "../../../../util/interface/TypedResponse";
import { newAccountModel } from "../model/createAccountModel";
import passwordHasher from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { ValidateUserAndRefererEmail } from "../model/validateUserAndRefererEmail";

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
    surety_email:string,
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

        const isEmailSentLinkAlreadyGenerated = await ValidateUserAndRefererEmail.findOne({email_to_validate:req.body.email,who_to_validate:'user_email'})

        if(isEmailSentLinkAlreadyGenerated){

            res.status(SERVER_STATUS.BAD_REQUEST).json({
                title:'New Account Message',
                status:SERVER_STATUS.BAD_REQUEST,
                successful:false,
                message:'A verification link has already been sent to this email address. Please check your inbox.'
            })
    
            return
          }
         if(req.body.surety_email === req.body.email){
  res.status(SERVER_STATUS.BAD_REQUEST).json({
                title:'New Account Message',
                status:SERVER_STATUS.BAD_REQUEST,
                successful:false,
                message:'You  cannot serve as a surety for yourself.'
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

   //send email with magic link to verify email

   const verify_email_link = await generateMagicLinkCode()

 await sendMail({
            receiver:req.body.email,
            subject:'Complete your Horeb Save account registration',
            template:'registeration_email.ejs',
            emailData:{
              fullName:`${req.body.first_name} ${req.body.last_name}`,
             
              verify_email_link:verify_email_link
            }
 })


 await sendMail({
            receiver:req.body.surety_email,
            
            subject:'Horeb Save Guarantor Verification',
            template:'guarantor_verification_email.ejs',
            emailData:{
              fullName:`${req.body.surety_email}`,
              guarantee:`${req.body.first_name} ${req.body.last_name}`,
             
              verify_email_link:verify_email_link
            }
 })

 
 

   await new ValidateUserAndRefererEmail({
        who_to_validate:'user_email',
        email_to_validate:req.body.email,
        magic_link:verify_email_link,
        temp_data:req.body
      
  }).save()

  await new ValidateUserAndRefererEmail({
        who_to_validate:'referer_email',
        email_to_validate:req.body.surety_email,
        magic_link:verify_email_link,
        temp_data:req.body,
        standing_for:req.body.email
        
      
  }).save()

  res.status(SERVER_STATUS.SUCCESS).json({
        title:'Create New Account Message',
        status:SERVER_STATUS.SUCCESS,
        successful:true,
        message:"Email sent to verify your email address  !!!!",
       data:{isEmailSent:true}
      })

      
    
    }catch(e:any){

   res.status(SERVER_STATUS.INTERNAL_SERVER_ERROR).json({
        title:'Create New Account Message',
        status:SERVER_STATUS.INTERNAL_SERVER_ERROR,
        successful:false,
        message:"New Account creation failed",
        error:e.message
      })
        
    }



}


export const verifyEmailLink = async (req:TypedRequest<{}>,res:TypedResponse<ResponseBodyProps>) =>{

  try {

    const magicLinkCode = req.query.code as string

    

    const validateMagicLink = await ValidateUserAndRefererEmail.findOne({magic_link:process?.env?. base_url?.concat('api/v1/horebSave/auth/verify-email?code=').concat(magicLinkCode)})


    if(validateMagicLink && validateMagicLink.who_to_validate === 'user_email'){



         const salt = await passwordHasher.genSalt(10)

         const hashedPassword  = await passwordHasher.hash(validateMagicLink.temp_data.password,salt)


     const newAccount = new newAccountModel({
        ...validateMagicLink.temp_data,
        password:hashedPassword
     })

      await newAccount.save()

      res.redirect(process?.env?.FRONTEND_BASE_URL!!.concat('/login'))

   //   const token = jwt.sign({email:validateMagicLink.temp_data.email,first_name:validateMagicLink.temp_data.first_name,last_name:validateMagicLink.temp_data.last_name},process?.env?.APP_SECRET_TOKEN_SIGNER_KEY!!)

      /*res.status(SERVER_STATUS.CREATED).json({
        title:'Create New Account Message',
        status:SERVER_STATUS.CREATED,
        successful:true,
        message:"New Account Created Successfully !!!!",
        data:{
         
        token,

        }
      })*/
     
     

        return
    }

     res.status(SERVER_STATUS.BAD_REQUEST).json({
          title:'Verify Email Link',
          successful:false,
          status:SERVER_STATUS.BAD_REQUEST,
          message:'Invalid or expired link.',
        
        })
    
  } catch (error:any) {
        res.status(SERVER_STATUS.INTERNAL_SERVER_ERROR).json({
          title:'Verify Email Link',
          successful:false,
          status:SERVER_STATUS.INTERNAL_SERVER_ERROR,
          message:'Something went wrong try again.',
         error
    
  })
}
}

export const loginAccount = async  (req:TypedRequest<{email:string,password:any}>,res:TypedResponse<ResponseBodyProps>) =>{

  try {

     
    const {email,password} = req.body




     let user = await newAccountModel.findOne({email})

   

      if(user){
      

        
        const isPasswordValid = await  passwordHasher.compare(password,user.password!!)

         if(isPasswordValid){

            const token = jwt.sign({
          first_name:user.first_name,
          last_name:user.last_name,
          email:user.email
        },process?.env?.APP_SECRET_TOKEN_SIGNER_KEY!!,{expiresIn:1500})

   await user.updateOne({last_seen:Date.now(),isLoggedIn:true,lastLoggedInToken:token})

   user =   await newAccountModel.findOne({email})

        res.status(SERVER_STATUS.SUCCESS).json({
          title:'Login Account',
          successful:true,
          status:SERVER_STATUS.SUCCESS,
          message:'Successfully logged in.',
          data:{
            ...user?.toObject(),
            token
          }
        })

          return
         }



          res.status(SERVER_STATUS.BAD_REQUEST).json({
          title:'Login Account',
          successful:false,
          status:SERVER_STATUS.BAD_REQUEST,
          message:'Invalid credential provided.',
        
        })

      
      }else{

          res.status(SERVER_STATUS.BAD_REQUEST).json({
          title:'Login Account',
          successful:false,
          status:SERVER_STATUS.BAD_REQUEST,
          message:'Invalid credential provided.',
        
        })

        

      }
    
  } catch (error:any) {

    res.status(SERVER_STATUS.INTERNAL_SERVER_ERROR).json({
          title:'Login Account',
          successful:false,
          status:SERVER_STATUS.INTERNAL_SERVER_ERROR,
          message:'Something went wrong try again.',
          error:error.message
        
        })
    
  }
   
}

export const logout = async  (req:TypedRequest<any>,res:TypedResponse<ResponseBodyProps>) =>{

   try {
    
      const user =  await newAccountModel.findOne({email:req.user?.email})

      if(user &&  user.email && user.isLoggedIn){
        await newAccountModel.updateOne({last_seen:Date.now(),isLoggedIn:false,lastLoggedInToken:''})
        res.status(SERVER_STATUS.SUCCESS).json({
          title:'Logout Account',
          successful:true,
          status:SERVER_STATUS.SUCCESS,
          message:'Successfully logged out.',
         
        })
        return
      }

      res.status(SERVER_STATUS.UNAUTHORIZED).json({
          title:'Logout Account',
          successful:false,
          status:SERVER_STATUS.UNAUTHORIZED,
          message:'Not authorized.',
     
        
        })

   } catch (error:any) {

    res.status(SERVER_STATUS.INTERNAL_SERVER_ERROR).json({
          title:'Logout Account',
          successful:false,
          status:SERVER_STATUS.INTERNAL_SERVER_ERROR,
          message:'Something went wrong try again.',
         error:error.message
        
        })
    
   }
  

}


export const getUserProfile = async (req:TypedRequest<any>,res:TypedResponse<ResponseBodyProps>) =>{

  try {

   const email = req.user?.email
    
   const user = await newAccountModel.findOne({email})


     if(user && user.isLoggedIn){

       res.status(SERVER_STATUS.SUCCESS).json({
        title:'Get current user profile',
        status:SERVER_STATUS.SUCCESS,
        successful:true,
        message:"Successfully fetched.",
        data:user
       })

       return
     }

    
       res.status(SERVER_STATUS.UNAUTHORIZED).json({
          title:'Get current user profile',
          successful:false,
          status:SERVER_STATUS.UNAUTHORIZED,
          message:'Unauthorized',
        
        
        })


    
  } catch (error:any) {
    
      res.status(SERVER_STATUS.INTERNAL_SERVER_ERROR).json({
          title:'Logout Account',
          successful:false,
          status:SERVER_STATUS.INTERNAL_SERVER_ERROR,
          message:'Something went wrong try again.',
         error:error.message
        
        })
  }

}


export const refreshToken = async (req:TypedRequest<any>,res:TypedResponse<ResponseBodyProps>) =>{

 
  try {

  const body = req.body
  const token = body.token
  const user_id = body.user_id


  //check if user is registered 
  const user = await newAccountModel.findOne({_id:user_id}).select('+lastLoggedInToken')

  if(user && user.isLoggedIn){

    

    
    if(user.lastLoggedInToken!==token){
        res.status(SERVER_STATUS.Forbidden).json({
          title:'Refresh Token',
          successful:false,
          status:SERVER_STATUS.Forbidden,
          message:'Invalid token provided.',
        
        })
        return
    }


     jwt.verify(token,process?.env?.APP_SECRET_TOKEN_SIGNER_KEY!!,async (err:any)=>{
       if(err){

         if(err.name === 'TokenExpiredError'){

            const token = jwt.sign({
          first_name:user.first_name,
          last_name:user.last_name,
          email:user.email
        },process?.env?.APP_SECRET_TOKEN_SIGNER_KEY!!,{expiresIn:1500})
        
        await user.updateOne({lastLoggedInToken:token})

          res.status(SERVER_STATUS.SUCCESS).json({
          title:'Refresh Token',
          successful:true,
          status:SERVER_STATUS.SUCCESS,
          message:'Token refreshed.',
          data:{
            new_token:token
          }
        
        })


           
          return
         }



          res.status(SERVER_STATUS.Forbidden).json({
          title:'Refresh Token',
          successful:false,
          status:SERVER_STATUS.Forbidden,
          message:'Invalid token provided.',
        
        })

   
      return 
       }
       


        res.status(SERVER_STATUS.BAD_REQUEST).json({
          title:'Refresh Token',
          successful:false,
          status:SERVER_STATUS.BAD_REQUEST,
          message:'Token not expired.',
        
        })

     

     })

return
  }

   res.status(SERVER_STATUS.Forbidden).json({
          title:'Reresh Token',
          successful:false,
          status:SERVER_STATUS.Forbidden,
          message:'Invalid details.',
        
        })



    
  } catch (error) {


        res.status(SERVER_STATUS.INTERNAL_SERVER_ERROR).json({
          title:'Refresh Token',
          successful:false,
          status:SERVER_STATUS.INTERNAL_SERVER_ERROR,
          message:'Invalid credential provided.',
        
        })
    
  }



}

 
export const updateUserDetails = async (req:TypedRequest<any>,res:TypedResponse<ResponseBodyProps>) =>{

    try {
   
      let user =  await newAccountModel.findOne({email:req.user?.email})



      if(user && user.isLoggedIn){

           await user.updateOne(req.body)

         user = await newAccountModel.findOne({email:user.email})

          res.status(SERVER_STATUS.SUCCESS).json({
          title:'Update user details',
          successful:true,
          status:SERVER_STATUS.SUCCESS,
          message:'Successfull.',
        
        })


      }else{

          res.status(SERVER_STATUS.UNAUTHORIZED).json({
          title:'Update user details',
          successful:false,
          status:SERVER_STATUS.UNAUTHORIZED,
          message:'Unauthorized access.',
        
        })
      }
      
    } catch (error) {

        res.status(SERVER_STATUS.INTERNAL_SERVER_ERROR).json({
          title:'Update user details',
          successful:false,
          status:SERVER_STATUS.INTERNAL_SERVER_ERROR,
          message:'Invalid details.',
        
        })
      
    }
}



const generateMagicLinkCode = async () =>{
    console.log(`fired magic link...`)
   const isMagicLinkGeneratedBefore =  await ValidateUserAndRefererEmail.findOne({magic_link:process?.env?. base_url?.concat('verify-email?code=').concat(v4())})

   while(isMagicLinkGeneratedBefore){
      return generateMagicLinkCode()
   }
   
   return process?.env?. base_url?.concat('api/v1/horebSave/auth/verify-email?code=').concat(v4())
}