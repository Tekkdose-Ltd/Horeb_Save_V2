import  z from 'zod'
import { Request,NextFunction } from 'express';
import SERVER_STATUS from '../util/interface/CODE';
import TypedResponse from '../util/interface/TypedResponse';
import { ResponseBodyProps } from '../util/interface/ResponseBodyProps';

export default  <T extends z.ZodType>(shema:T) =>{
 return (req:Request,res:TypedResponse<ResponseBodyProps>,next:NextFunction)=>{
   
    try{

         if(req.body.date_of_birth){
            const datetime = z.string().datetime();
            req.body = shema.parse({
                ...req.body,
          date_of_birth:datetime.parse(req.body.date_of_birth)
            })
            next()
            return
         }
        req.body = shema.parse(req.body)

        next()

    }catch(e:any){

        

        if(e instanceof z.ZodError){
  
            const formattedErrors = e.issues.map(issue => ({
      path: issue.path.join('.'),
      message: issue.message,
      code: issue.code,
    }));
            res.status(SERVER_STATUS.BAD_REQUEST).json({
                title:"Body Response Validation",
                status:SERVER_STATUS.BAD_REQUEST,
                successful:false,
                message:'Failed to validate body response',
                error:formattedErrors
            })

            return
        }

        next(e)

    }
 }
}