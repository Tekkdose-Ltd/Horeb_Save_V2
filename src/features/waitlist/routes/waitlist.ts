
import express from 'express'
import validateRequestBody from '../../../middleware/validateRequestBody'
import { waitlistValidationSchema } from '../schema'
import { getAllWaitList, newWaitlist } from '../controller/waitlist'
import userAuthenticationMiddleware from '../../../middleware/userAuthenticationMiddleware'


const waitlistRouter = express.Router()

/**
 * @swagger
 * /api/v1/horebSave/waitlist/join:
 *     post:
 *        summary: A user provide details to join waitlist.
 *        tags: [Waitlist]
 *        requestBody:
 *                 description: User data
 *                 required: true
 *                 content:   
 *                     application/json:
 *                           schema:
 *                             type: object
 *                             properties:
 *                                    email: 
 *                                       type: string
 *                                       format: email
 *                                       description: email required to setup account.
 *                                    saving_method: 
 *                                       type: string
 *                                       
 *                                       description: saving method.
 *                                    first_name: 
 *                                       type: string
 *                                       
 *                                       description: first name to set up new account.
 * 
 *                                    last_name: 
 *                                       type: string
 *                                       
 *                                       description: last name to set up new account.
 * 
 *                                    income_pattern: 
 *                                      type: string
 *                                       
 *                                      description: Income pattern.
 * 
 *                                    phone_number: 
 *                                        type: string
 *                                       
 *                                        description: last name to set up new account.
 * 
 * 
 *                                    priority: 
 *                                        type: string
 *                                       
 *                                        description: piority .
 * 
 *                                    goal: 
 *                                        type: string
 *                                       
 *                                        description: Goals user intend to achieve.
 * 
 * 
 *                                    early_access: 
 *                                        type: string
 *                                       
 *                                        description: early access.
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




waitlistRouter.post('/join',validateRequestBody(waitlistValidationSchema),newWaitlist)




/**
 * @swagger
 * /api/v1/horebSave/waitlist/:
 *     get:
 *        summary: Get all waitlist.
 *        tags: [Waitlist]
 *        
 *        responses:
 *                200:
 *                 description: Groups fetched successfully.
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

waitlistRouter.get('/',userAuthenticationMiddleware,getAllWaitList)


export default waitlistRouter