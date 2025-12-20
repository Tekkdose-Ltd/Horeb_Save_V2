import express from 'express'
import userAuthenticationMiddleware from '../../middleware/userAuthenticationMiddleware'
import validateRequestBody from '../../middleware/validateRequestBody'
import { contributionValidationSchema } from './schema'
import { contributeToGroup } from '../groups/controller/contributions'
import { getMyTransactions } from './controller/paymentController'

const paymentRouter =  express.Router()


/**
 * @swagger
 * /api/v1/horebSave/payment/contribute:
 *     post:
 *        summary: Make payment .
 *        tags: [Payment]
 *        requestBody:
 *                 description: User data
 *                 required: true
 *                 content:   
 *                     application/json:
 *                           schema:
 *                             type: object
 *                             properties:
 *                                     member_id: 
 *                                       type: string
 *                                       
 *                                       description: member id.
 *                                     group_id: 
 *                                       type: string
 *                                       
 *                                       description: group id.
 *                                     amount: 
 *                                       type: number
 *                                       
 *                                       description: Amount.
 *                                    
 * 
 * 
 * 
 * 
 *                           required:
 *                               -email
 *                               -password
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


paymentRouter.post('/contribute',userAuthenticationMiddleware,validateRequestBody(contributionValidationSchema),contributeToGroup)


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


export default paymentRouter