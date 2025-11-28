  import express from 'express'
import userAuthenticationMiddleware from '../../../middleware/userAuthenticationMiddleware'
import validateRequestBody from '../../../middleware/validateRequestBody'
import { createNewGroupValidationSchema } from '../shema'
import { createNewGroup, getPublicGroups, joinGroupByLink } from '../controller/groups'


const groupsRouter =  express.Router()

 export const groupInvite = express.Router()


          

/**
 * @swagger
 * /api/v1/horebSave/groups/:
 *     post:
 *        summary: A user provide name  and other details required  to create new group.
 *        tags: [Groups]
 *        requestBody:
 *                 description: User data
 *                 required: true
 *                 content:   
 *                     application/json:
 *                           schema:
 *                             type: object
 *                             properties:
 *                                     name: 
 *                                       type: string
 *                                       
 *                                       description: name of the group.
 *                                     is_public: 
 *                                       type: boolean
 *                                       
 *                                       description: If group is private or public.
 *                                     description: 
 *                                       type: string
 *                                       
 *                                       description: A description about group.
 *                                     total_round: 
 *                                       type: number
 *                                       
 *                                       description: Total rounds to go.
 *                                     frequency: 
 *                                       type: string
 *                                       
 *                                       description: The frequency either 'weekly' or 'monthly' or'bi-weekly'.
 * 
 *                                     contribution_amount: 
 *                                       type: number
 *                                       
 *                                       description: Contribution amount.
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


groupsRouter.post('/',userAuthenticationMiddleware,validateRequestBody(createNewGroupValidationSchema),createNewGroup)



/**
 * @swagger
 * /api/v1/horebSave/groups/public:
 *     get:
 *        summary: Get public groups.
 *        tags: [Groups]
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

groupsRouter.get('/public',userAuthenticationMiddleware,getPublicGroups)





export default groupsRouter