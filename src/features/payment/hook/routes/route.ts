
import express from 'express'
import { getPaymentHookResponse, newAccountSetupHook } from '../controller/webhook'


const hookRouter =  express.Router()


hookRouter.post('',getPaymentHookResponse)

hookRouter.post('/account/response',newAccountSetupHook)




export default hookRouter