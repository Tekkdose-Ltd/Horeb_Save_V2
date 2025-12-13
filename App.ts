import express from 'express'
import { errorHandler } from './src/middleware/errorHandlerMiddleware';
import mainAppRouter from './src/routes';
import { connectDB } from './src/config/database/databaseConfig';
import swaggerUI from "swagger-ui-express";
import swaggersetup from "./src/config/api-docummentation/swaggersetup";
import cors from "cors";
import dotenv from "dotenv";
import { groupInvite } from './src/features/groups/route/groups';
import PaymentGateWay from './src/features/payment/paymentSetup';
dotenv.config();


const app = express()

app.use(cors({origin:'*',allowedHeaders:['Content-Type','Authorization'],
  methods:['GET','POST','PUT','DELETE','OPTIONS']}));



// api docummentation setup
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggersetup));

//allow json body api request
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

//handle all routes of the app
app.use('/api/v1/horebSave',mainAppRouter)


app.get('/api/groups/:groupId/members/:memberId/ratings',(req,res)=>{
    console.log(`${req.params}`)
    res.send('Horeb Save Backend is running')
})
app.get('/webhook/payment/response',(req,res)=>{

  console.log( `${req.body}`)

  res.status(200).end()

})

//handle general error of the app
app.use(errorHandler)


//connect to mongose db before starting sever
connectDB().then((e)=>{
     app.listen(3050,async()=>{
           console.log('Listening to port 3050')

           try {

             const payment = await PaymentGateWay.getPaymentGateWayInstance()

       //    const session = await  payment.create_payment_intent('benjoe',300000,'NGN')
//
         //  console.log(session)
            
           } catch (error:any) {
            console.log(`error ${error.message}`)
           }
  
 
})
  
}).catch(()=>{
    process.exit(1)
})

