import SERVER_STATUS from "../../../util/interface/CODE";
import { ResponseBodyProps } from "../../../util/interface/ResponseBodyProps";
import TypedRequest from "../../../util/interface/TypedRequest";
import TypedResponse from "../../../util/interface/TypedResponse";
import { newGroupModel } from "../model/groups";
import { GroupTrustRatingModel } from "../model/trustRatings";


export const newGroupTrustRating = async (req:TypedRequest<{group_id:string,group_member_id:string,rating_score:number,description?:string}>,res:TypedResponse<ResponseBodyProps>)=>{

 try {

    const {group_id,group_member_id,rating_score,description} = req.body
    const user = req.user
    
    /**
     * create new trust rating
     */
    const isGroupValid = await newGroupModel.findOne({group_id:group_id,'members.id':group_member_id})

    if(!isGroupValid){
        return res.status(SERVER_STATUS.BAD_REQUEST).json({
            title:'New Group Trust Rating Message',
            status:SERVER_STATUS.BAD_REQUEST,
            successful:false,
            message:'Invalid group or group member.'
        })
    }
    
    const newTrustRating = await GroupTrustRatingModel.create({
        group_id:group_id,
        member_id:group_member_id,
        trust_rating:rating_score,
        description:description,
        rated_by:user?._id
     })

     res.status(SERVER_STATUS.CREATED).json({
        title:'New Group Trust Rating Message',
        status:SERVER_STATUS.CREATED,
        successful:true,
        message:'Group trust rating created successfully.',
        data:newTrustRating
     })
    
 } catch (error) {
    
    res.status(SERVER_STATUS.INTERNAL_SERVER_ERROR).json({
        title:'New Group Trust Rating Message',
        status:SERVER_STATUS.INTERNAL_SERVER_ERROR,
        successful:false,
        message:'Internal server error.',
        error:error instanceof Error ? error.message : 'Unknown error'
    })
 }
}

export const getGroupMemberTrustRatings = async (req:TypedRequest<{group_id:string,member_id:string}>,res:TypedResponse<ResponseBodyProps>)=>{

    try {
   
       const {group_id,member_id} = req.body
       
       /**
        * fetch trust ratings
        */
       
       const trustRatings = await GroupTrustRatingModel.find({group_id:group_id,member_id:member_id})
   
        res.status(SERVER_STATUS.SUCCESS).json({
           title:'Get Group Member Trust Ratings Message',
           status:SERVER_STATUS.SUCCESS,
           successful:true,
           message:'Group member trust ratings fetched successfully.',
           data:trustRatings
        })
       
    } catch (error) {
       
       res.status(SERVER_STATUS.INTERNAL_SERVER_ERROR).json({
           title:'Get Group Member Trust Ratings Message',
           status:SERVER_STATUS.INTERNAL_SERVER_ERROR,
           successful:false,
           message:'Internal server error.',
           error:error instanceof Error ? error.message : 'Unknown error'
       })
    }
   }
