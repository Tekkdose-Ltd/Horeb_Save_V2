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
import hookRouter from './src/features/payment/hook/routes/route';
import { BackgroundService, Services } from './src/features/backgroundTask/backgroundServiceClass';
import { startContributionSchedule } from './src/features/backgroundTask/contributionService';
import { countryCurrency } from './src/util/countryCurrency';
dotenv.config();


const app = express()

app.use(cors({origin:'*',allowedHeaders:['Content-Type','Authorization'],
  methods:['GET','POST','PUT','DELETE','OPTIONS']}));

app.use('/webhook/payment/response',express.raw({type: 'application/json'}),hookRouter)

app.use('/webhook/new',express.raw({type: 'application/json'}),hookRouter)

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




//handle general error of the app
app.use(errorHandler)


//connect to mongose db before starting sever
connectDB().then((e)=>{
     app.listen(3050,async()=>{
           console.log('Listening to port 3050')

           try {
           BackgroundService.getInstance()
   //startContributionSchedule('90977665','67865444',new Date())
      
      //  const result = await  (await PaymentGateWay.getPaymentGateWayInstance()).send_money_to_due_user('acct_1StWnXKiJCcuMAf0',2000,'ngn')

        //const result = await  (await PaymentGateWay.getPaymentGateWayInstance()).auto_charge_user('pm_1StYrXKxLbpn3b97Xrwb5923',2000,'cus_TrGGKVZ7itM7xv',"uwuuqwhsjllakak","7637272727",1)
      // console.log('result',result)


           } catch (error:any) {
            console.log(`error ${error.message}`)
           }
  
 
})
  
}).catch(()=>{
    process.exit(1)
})

