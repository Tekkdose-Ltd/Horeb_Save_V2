import express from 'express'
import { errorHandler } from './src/middleware/errorHandlerMiddleware.ts';
import mainAppRouter from './src/routes.ts';
import { connectDB } from './src/config/database/databaseConfig.ts';
import swaggerUI from "swagger-ui-express";
import swaggersetup from "./src/config/api-docummentation/swaggersetup.ts";
import cors from "cors";
import dotenv from "dotenv";
import { groupInvite } from './src/features/groups/route/groups.ts';
dotenv.config();


const app = express()

app.use(cors())

// api docummentation setup
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggersetup));

//allow json body api request
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

//handle all routes of the app
app.use('/api/v1/horebSave',mainAppRouter)





//handle general error of the app
app.use(errorHandler)


//connect to mongose db before starting sever
connectDB().then((e)=>{
     app.listen(3050,()=>{
           console.log('Listening to port 3050')
 
 
})
  
}).catch(()=>{
    process.exit(1)
})

