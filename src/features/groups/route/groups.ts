  import express from 'express'
import userAuthenticationMiddleware from '../../../middleware/userAuthenticationMiddleware'
import validateRequestBody from '../../../middleware/validateRequestBody'
import { activateContributionValidationSchema, createNewGroupValidationSchema, joinGroupValidationSchema, newGroupTrustRatingValidationSchema } from '../shema'
import { createNewGroup, getMyActiveGroups, getMyGroups, getPublicGroups, joinGroupByInviteCode } from '../controller/groups'
import { newGroupTrustRating } from '../controller/trustRatings'
import { startGroupContribution } from '../controller/contributions'


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
 *                                     max_number_of_members: 
 *                                       type: number
 *                                       
 *                                       description: Total number in a group.
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





/**
 * @swagger
 * /api/v1/horebSave/groups/join:
 *     post:
 *        summary: A user provide invition code to join group.
 *        tags: [Groups]
 *        requestBody:
 *                 description: User data
 *                 required: true
 *                 content:   
 *                     application/json:
 *                           schema:
 *                             type: object
 *                             properties:
 *                                    invite_code: 
 *                                       type: string
 *                                       
 *                                       description: code to join group.
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

groupsRouter.post('/join',validateRequestBody(joinGroupValidationSchema),userAuthenticationMiddleware,joinGroupByInviteCode)



/**
 * @swagger
 * /api/v1/horebSave/groups/my:
 *     get:
 *        summary: Get user groups.
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

groupsRouter.get('/my',userAuthenticationMiddleware,getMyGroups)



/**
 * @swagger
 * /api/v1/horebSave/groups/my-active-groups:
 *     get:
 *        summary: Get user active  groups.
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

groupsRouter.get('/my-active-groups',userAuthenticationMiddleware,getMyActiveGroups)




/**
 * @swagger
 * /api/v1/horebSave/groups/rating:
 *     post:
 *        summary: Group member create a trust rating score for  other members.
 *        tags: [Rating]
 *        requestBody:
 *                 description: User data
 *                 required: true
 *                 content:   
 *                     application/json:
 *                           schema:
 *                             type: object
 *                             properties:
 *                                   group_id: 
 *                                       type: string
 *                                       
 *                                       description: group id.
 * 
 *                                   group_member_id:
 *                                       type: string
 *                                       description: group member id to be rated.
 * 
 *                                  
 *                                   rating_score:
 *                                      type: number
 *                                      description: trust rating score.
 *                                   description:
 *                                     type: string
 *                                     description: optional description about the rating.
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

groupsRouter.post('/rating',userAuthenticationMiddleware,validateRequestBody(newGroupTrustRatingValidationSchema),newGroupTrustRating)



/**
 * @swagger
 * /api/v1/horebSave/groups/activate_contribution:
 *     post:
 *        summary: Activate contribution as admin of group.
 *        tags: [Groups]
 *        requestBody:
 *                 description: User data
 *                 required: true
 *                 content:   
 *                     application/json:
 *                           schema:
 *                             type: object
 *                             properties:
 *                                     group_id: 
 *                                       type: string
 *                                       
 *                                       description: group id.
 *                                      
 *                                     creator_of_group_id:
 *                                       type: string
 *                                       
 *                                       description:  creator_of_group_id.
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


groupsRouter.post('/activate_contribution',userAuthenticationMiddleware,validateRequestBody(activateContributionValidationSchema),startGroupContribution)


export default groupsRouter