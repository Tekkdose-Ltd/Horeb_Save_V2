
import mongoose from  'mongoose'
import dotenv from 'dotenv'
dotenv.config()

console.log(process.env.STAGING_URL!!)


// Create a MongoClient with a MongoClientOptions object to set the Stable API version

 export  const connectDB = async () =>{
   return mongoose.connect(process.env.STAGING_URL!!)
 } 
