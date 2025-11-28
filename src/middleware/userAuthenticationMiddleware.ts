import {NextFunction} from "express";

import jwt  from 'jsonwebtoken'
import { newAccountModel } from "../features/auth/account/model/createAccountModel";
import SERVER_STATUS from "../util/interface/CODE";
import { ResponseBodyProps } from "../util/interface/ResponseBodyProps";
import TypedRequest from "../util/interface/TypedRequest";
import TypedResponse from "../util/interface/TypedResponse";





export interface  AuthMiddlewareProps{
    _id:any,
    email:string,
    password: string,
    role:string
}


 export default async  (req:TypedRequest<any>,res:TypedResponse<ResponseBodyProps>,next:NextFunction) =>{
   console.log('fired now...')

   try{
        
    const authHeader = req?.headers?.authorization 
    

  

       if(!authHeader){

        res.status(SERVER_STATUS.UNAUTHORIZED).json({
            title:"Aunthentication Message",
            status:SERVER_STATUS.UNAUTHORIZED,
            successful:false,
            message:"Authorization header is needed to continue."
            
        })
 
       
        return
    }


  
    const token  =  authHeader?.split(' ')[1]

    if(!token){
        res.status(SERVER_STATUS.BAD_REQUEST).json({
            title:"Aunthentication Message",
            status:SERVER_STATUS.BAD_REQUEST,
            successful:false,
            message:"Invalid token provided."
            
        })
    }

     
     const validToken = (jwt.verify(token!!,process.env?.APP_SECRET_TOKEN_SIGNER_KEY!!) as unknown) as AuthMiddlewareProps
  
     const isUserValid = await newAccountModel.findOne({email:validToken.email}).select('+lastLoggedInToken')

   

   if(!isUserValid || isUserValid.lastLoggedInToken !== token ){

    res.status(SERVER_STATUS.Forbidden).json({
        title:"Aunthentication Message",
        status:SERVER_STATUS.Forbidden,
        successful:false,
        message:"Invalid token provided.",
       
    })
    return
   }
 
    req.user = {...validToken,_id:isUserValid._id!!}
    next()




}catch(error:any){

    res.status(SERVER_STATUS.INTERNAL_SERVER_ERROR).json({
        title:"Aunthentication Message",
        status:SERVER_STATUS.INTERNAL_SERVER_ERROR,
        successful:false,
        message:"An error occured.",
         error:error.message
    })
   
}

 }