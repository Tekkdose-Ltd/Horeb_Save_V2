import express from 'express'
import { createNewAccount, getUserProfile, loginAccount, logout, refreshToken, updateUserDetails } from '../controller/account'
import validateRequestBody from '../../../../middleware/validateRequestBody'
import { CreateNewAccountValidationSchema, LoginAccountValidationSchema, refreshTokenValidationSchema, updateUserDetailsValidationSchema } from '../../schema'
import userAuthenticationMiddleware from '../../../../middleware/userAuthenticationMiddleware'

const accountRouter = express.Router()


type t={email:string,
  password:string,
    first_name:string,
    last_name:string,
    profile_image_url:string,
    phone_number:string,
    date_of_birth:Date,
    address_line_1:string,
    address_line_2:string,
    city:string,
    postalCode:string,
    country:string,
    profile_completed:boolean,
    stripe_customer_id:string,
    trust_score:number,
    total_groups_completed:number,
    on_time_payment_rate:number
}

/**
 * @swagger
 * /api/v1/horebSave/auth/register:
 *     post:
 *        summary: A user provide email  and password to create new account.
 *        tags: [Account]
 *        requestBody:
 *                 description: User data
 *                 required: true
 *                 content:   
 *                     application/json:
 *                           schema:
 *                             type: object
 *                             properties:
 *                                     email: 
 *                                       type: string
 *                                       format: email
 *                                       description: email required to setup account.
 *                                     password: 
 *                                       type: string
 *                                       
 *                                       description: password to set up new account.
 *                                     first_name: 
 *                                       type: string
 *                                       
 *                                       description: first name to set up new account.
 * 
 *                                     last_name: 
 *                                       type: string
 *                                       
 *                                       description: last name to set up new account.
 * 
 *                                     profile_image_url: 
 *                                      type: string
 *                                       
 *                                      description: a base 64 string image to set up new account profile.
 * 
 *                                     phone_number: 
 *                                        type: string
 *                                       
 *                                        description: last name to set up new account.
 * 
 * 
 *                                     date_of_birth: 
 *                                        type: string
 *                                       
 *                                        description: user date of birth to set up new account.
 * 
 * 
 *                                     address_line_1: 
 *                                        type: string
 *                                       
 *                                        description: address line  1 to set up new account.
 * 
 * 
 *                                     address_line_2: 
 *                                        type: string
 *                                       
 *                                        description: address line 2 to set up new account.
 * 
 * 
 *                                     city: 
 *                                        type: string
 *                                       
 *                                        description: user city to set up new account.
 * 
 * 
 *                                     postalCode: 
 *                                        type: string
 *                                       
 *                                        description: user postal code to set up new account.
 * 
 * 
 *                                     country: 
 *                                        type: string
 *                                       
 *                                        description: user country to set up new account.
 * 
 *                                     profile_completed: 
 *                                      optionalField:
 *                                        type: boolean
 *                                       
 *                                        description: user country to set up new account.
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



accountRouter.post('/register',validateRequestBody(CreateNewAccountValidationSchema),createNewAccount)




/**
 * @swagger
 * /api/v1/horebSave/auth/login:
 *     post:
 *        summary: A user provide email  and password to login into account.
 *        tags: [Account]
 *        requestBody:
 *                 description: User data
 *                 required: true
 *                 content:   
 *                     application/json:
 *                           schema:
 *                             type: object
 *                             properties:
 *                                     email: 
 *                                       type: string
 *                                       format: email
 *                                       description: email required field to login.
 *                                     password: 
 *                                       type: string
 *                                       
 *                                       description: password required field to login.
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


accountRouter.post('/login',validateRequestBody(LoginAccountValidationSchema),loginAccount)


/**
 * @swagger
 * /api/v1/horebSave/auth/logout:
 *     post:
 *        summary: Log out account.
 *        tags: [Account]
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
 * 
 *        
 *            
 *  
 * 
 */



accountRouter.post('/logout',userAuthenticationMiddleware,logout)




/**
 * @swagger
 * /api/v1/horebSave/auth/user:
 *     get:
 *        summary: Get user profile.
 *        tags: [Account]
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
 * 
 *        
 *            
 *  
 * 
 */

accountRouter.get('/user',userAuthenticationMiddleware,getUserProfile)



/**
 * @swagger
 * /api/v1/horebSave/auth/refresh_token:
 *     post:
 *        summary: A token and user id is provided for refresh.
 *        tags: [Account]
 *        requestBody:
 *                 description: User data
 *                 required: true
 *                 content:   
 *                     application/json:
 *                           schema:
 *                             type: object
 *                             properties:
 *                                     token: 
 *                                       type: string
 *                                       format: string
 *                                       description: token to be refreshed.
 *                                     user_id: 
 *                                       type: string
 *                                       
 *                                       description: user id of user.
 *                                
 * 
 * 
 * 
 * 
 *                           required:
 *                               -token
 *                               -user_id
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
accountRouter.post('/refresh_token',validateRequestBody(refreshTokenValidationSchema),refreshToken)





/**
 * @swagger
 * /api/v1/horebSave/auth/profile:
 *     put:
 *        summary: A user updates his/her details such as profile picture.
 *        tags: [Account]
 *        requestBody:
 *                 description: User data
 *                 required: true
 *                 content:   
 *                     application/json:
 *                           schema:
 *                             type: object
 *                             properties:
 *                                    
 *                                     first_name: 
 *                                       type: string
 *                                       
 *                                       description: first name to set up new account.
 * 
 *                                     last_name: 
 *                                       type: string
 *                                       
 *                                       description: last name to set up new account.
 * 
 *                                     profile_image_url: 
 *                                      type: string
 *                                       
 *                                      description: a base 64 string image to set up new account profile.
 * 
 *                                     phone_number: 
 *                                        type: string
 *                                       
 *                                        description: last name to set up new account.
 * 
 * 
 *                                     date_of_birth: 
 *                                        type: string
 *                                       
 *                                        description: user date of birth to set up new account.
 * 
 * 
 *                                     address_line_1: 
 *                                        type: string
 *                                       
 *                                        description: address line  1 to set up new account.
 * 
 * 
 *                                     address_line_2: 
 *                                        type: string
 *                                       
 *                                        description: address line 2 to set up new account.
 * 
 * 
 *                                     city: 
 *                                        type: string
 *                                       
 *                                        description: user city to set up new account.
 * 
 * 
 *                                     postalCode: 
 *                                        type: string
 *                                       
 *                                        description: user postal code to set up new account.
 * 
 * 
 *                                     country: 
 *                                        type: string
 *                                       
 *                                        description: user country to set up new account.
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



accountRouter.put('/profile',validateRequestBody(updateUserDetailsValidationSchema),userAuthenticationMiddleware,updateUserDetails)



export default accountRouter