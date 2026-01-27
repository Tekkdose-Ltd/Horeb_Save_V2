import express from 'express'
import userAuthenticationMiddleware from '../../middleware/userAuthenticationMiddleware'
import validateRequestBody from '../../middleware/validateRequestBody'
import { contributionValidationSchema } from './schema'
import {  linkCardForPayment } from '../groups/controller/contributions'
import { createNewAndLinKAccount, getMyTransactions } from './controller/paymentController'

const paymentRouter =  express.Router()


/**
 * @swagger
 * /api/v1/horebSave/payment/linkCard:
 *     get:
 *        summary: Link card to make payment  .
 *        tags: [Payment]
 *       
 *        responses:
 *                200:
 *                 description: New account created successfully.
 *        content:
 *           application/json:
 *                shema:
 *                     type: object
 *                     properties:
 *                         email:
 *                            type: string
 *                            format: email
 *                    
 * 
 *        
 *            
 *  
 * 
 */


paymentRouter.get('/linkCard',userAuthenticationMiddleware,linkCardForPayment)


/**
 * @swagger
 * /api/v1/horebSave/payment/transaction/my:
 *     get:
 *        summary: Get user transactions.
 *        tags: [Transaction]
 *        
 *        responses:
 *                200:
 *                 description: Transactions fetched successfully.
 *        content:
 *           application/json:
 *                shema:
 *                     type: object
 *                     properties:
 *                         email:
 *                            type: string
 *                            format: email
 *                    
 * 
 *        
 *            
 * 
 *                    
 * 
 *        
 *            
 *  
 * 
 */


paymentRouter.get('/transaction/my',userAuthenticationMiddleware,getMyTransactions)


/**
 * @swagger
 * /api/v1/horebSave/payment/account/link:
 *     get:
 *        summary: Link user account for payment.
 *        tags: [Payment]
 *        
 *        responses:
 *                200:
 *                 description: Account linked  successfully.
 *        content:
 *           application/json:
 *                shema:
 *                     type: object
 *                     properties:
 *                         email:
 *                            type: string
 *                            format: email
 *                    
 * 
 *        
 *            
 * 
 *                    
 * 
 *        
 *            
 *  
 * 
 */

paymentRouter.get('/account/link',userAuthenticationMiddleware,createNewAndLinKAccount)


export default paymentRouter