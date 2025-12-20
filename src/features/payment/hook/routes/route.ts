
import express from 'express'
import { getPaymentHookResponse } from '../controller/webhook'


const hookRouter =  express.Router()


hookRouter.post('',getPaymentHookResponse)




export default hookRouter