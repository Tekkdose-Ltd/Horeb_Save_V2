import SERVER_STATUS from "../../../util/interface/CODE"
import { ResponseBodyProps } from "../../../util/interface/ResponseBodyProps"
import TypedRequest from "../../../util/interface/TypedRequest"
import TypedResponse from "../../../util/interface/TypedResponse"
import { ContributionModel } from "../model/contritubitions"
import { newGroupModel } from "../model/groups"





export const startGroupContribution = async (req:TypedRequest<{group_id:string,creator_of_group_id:string}>,res:TypedResponse<ResponseBodyProps>) =>{

    const user = req.user
    const {group_id,creator_of_group_id} = req.body

    try{

        const group = await newGroupModel.findOne({_id:group_id,creator_id:creator_of_group_id})

        if(!group){
            return res.status(SERVER_STATUS.BAD_REQUEST).json({
                title:'Start Group Contribution Message',
                status:SERVER_STATUS.BAD_REQUEST,
                successful:false,
                message:'Group not found.'
            })
        }

        if(group.creator_id.toString() !== user?._id.toString()){
            return res.status(SERVER_STATUS.UNAUTHORIZED).json({
                title:'Start Group Contribution Message',
                status:SERVER_STATUS.UNAUTHORIZED,
                successful:false,
                message:'Only group creator can start contribution.'
            })
        }

   
    //update next payout date based on frequency
    let nextPayoutDate = new Date()
    if(group.frequency === 'weekly'){

        nextPayoutDate.setDate(nextPayoutDate.getDate() + 7)
    }


    else if(group.frequency === 'bi-weekly'){
        nextPayoutDate.setDate(nextPayoutDate.getDate() + 14)
    }
    else if(group.frequency === 'monthly'){
        nextPayoutDate.setMonth(nextPayoutDate.getMonth() + 1)
    }

     await  group.updateOne({contribution_started:true,start_date:Date.now(),current_round:1,next_payout_date:nextPayoutDate.toDateString()})

    //initialize contrtibution document for the group
const contribution = await ContributionModel.findOne({group_id:group._id})

if(contribution){

    return res.status(SERVER_STATUS.BAD_REQUEST).json({
        title:'Start Group Contribution Message',
        status:SERVER_STATUS.BAD_REQUEST,
        successful:false,
        message:'Group contribution already started.'
    })
}

  

     new ContributionModel({
        group_id:group._id,
        constribution_started:true,
        amount:group.contribution_amount,
        current_round:1,
        member_due_for_payment:group.members[generateRandomNumber(0,group.members.length)].id
     }).save()


        res.status(SERVER_STATUS.SUCCESS).json({
            title:'Start Group Contribution Message',
            status:SERVER_STATUS.SUCCESS,
            successful:true,
            message:'Group contribution started successfully.'
        })

    }
    catch(error:any){
       
        res.status(SERVER_STATUS.INTERNAL_SERVER_ERROR).json({
            title:'Start Group Contribution Message',
            status:SERVER_STATUS.INTERNAL_SERVER_ERROR,
            successful:false,
            message:'Internal server error.',
            error:error.message
        })
    }

}


export const contributeToGroup = async (req:TypedRequest<{group_id:string,amount:number,member_id:string}>,res:TypedResponse<ResponseBodyProps>) =>{

    const user = req.user
    const {group_id,member_id,amount} = req.body


    try{

        const group = await newGroupModel.findById({group_id:group_id,'members.id':member_id})

        if(!group){
            return res.status(SERVER_STATUS.BAD_REQUEST).json({
                title:'Group Contribution Message',
                status:SERVER_STATUS.BAD_REQUEST,
                successful:false,
                message:'Group not found.'
            })
        }

        if(group.contribution_amount !== amount){
            return res.status(SERVER_STATUS.BAD_REQUEST).json({
                title:'Group Contribution Message',
                status:SERVER_STATUS.BAD_REQUEST,
                successful:false,
                message:`Contribution amount must be ${group.contribution_amount}.`
            })
        }



       

    }
    catch(error){
       
        res.status(SERVER_STATUS.INTERNAL_SERVER_ERROR).json({
            title:'Group Contribution Message',
            status:SERVER_STATUS.INTERNAL_SERVER_ERROR,
            successful:false,
            message:'Internal server error.'
        })
    }

}




const getDueMemberForPayment = async (groupId:string,currentRound:number) =>{

    const group = await newGroupModel.findById(groupId)

    if(!group){
        throw new Error('Group not found.')
    }

    const numberOfMembers = group.members.length

    const dueMemberIndex = (currentRound -1) % numberOfMembers

    return group.members[dueMemberIndex].id

}

const generateRandomNumber = (min:number,max:number) : number => {
   const number = Math.floor(Math.random() * (max - min + 1)) + min;
    while(number > max){
      generateRandomNumber(min,max)
    }
    return number
}