import { jwt } from "zod"
import SERVER_STATUS from "../../../util/interface/CODE"
import { ResponseBodyProps } from "../../../util/interface/ResponseBodyProps"
import TypedRequest from "../../../util/interface/TypedRequest"
import TypedResponse from "../../../util/interface/TypedResponse"
import { newGroupModel } from "../model/groups"
import {v4} from 'uuid'
import { ContributionModel } from "../model/contritubitions"

interface NewGroup {

    name: string,
     
     description: string,
     
     
      frequency:'weekly' | 'monthly' |'bi-weekly'
     
      contribution_amount:number
     
       
     
       is_public:boolean
       
       max_number_of_members:number


}


const getRandomCode = async ()=>{
  const code = v4()
    const isCodeGenerated = await newGroupModel.findOne({invite_code:code})
    while(isCodeGenerated){
      getRandomCode()
    }
  return code
}



export const createNewGroup =  async (req:TypedRequest<NewGroup>,res:TypedResponse<ResponseBodyProps>) => {


    try{

         /**
         * check if group already created with same name
         */
        const user = req.user
    
        const group = await  newGroupModel.findOne({name:req.body.name,creator_id:user?._id})
    
        if(group){
    
            res.status(SERVER_STATUS.BAD_REQUEST).json({
                title:'New Group Message',
                status:SERVER_STATUS.BAD_REQUEST,
                successful:false,
                message:'Group with name  already created.'
            })
    
            return
    
        }
    
         const code = await getRandomCode()
       
        const newGroup = new  newGroupModel({name:req.body.name,
          is_public:req.body.is_public,
          creator_id:user?._id,
          total_round:req.body.max_number_of_members,
          max_number_of_members:req.body.max_number_of_members,
          description:req.body.description,
          frequency:req.body.frequency,
          contribution_amount:req.body.contribution_amount})

        await newGroup.save()
 


        await newGroupModel.findOneAndUpdate({_id:newGroup._id},{members:[{id:user?._id,isAdmin:true}],invite_code:await getRandomCode()})
      

         const updatedGroup =  await newGroupModel.findOne({_id:newGroup._id})


      res.status(SERVER_STATUS.CREATED).json({
        title:'Create New Group Message',
        status:SERVER_STATUS.CREATED,
        successful:true,
        message:"New Group Created Successfully !!!!",
        data:{
         
        new_group:updatedGroup

        }
      })
     
    
    }catch(e:any){

   res.status(SERVER_STATUS.INTERNAL_SERVER_ERROR).json({
        title:'Create New Group Message',
        status:SERVER_STATUS.INTERNAL_SERVER_ERROR,
        successful:false,
        message:"New group creation failed",
        error:e.message
      })
        
    }



}



export const joinGroupByInviteCode = async (req:TypedRequest<{invite_code:string}>,res:TypedResponse<ResponseBodyProps>) => {


    try{

         /**
         * check if group already created with same name
         */
        const user = req.user
        const group_invitation_code = req.body.invite_code
      
     

          let group = await newGroupModel.findOne({invite_code:group_invitation_code})

          if(group){
            let members = group.members


            if(members.length === group.max_number_of_members){
              res.status(SERVER_STATUS.BAD_REQUEST).json({
        title:'Join Group By Invitation Message',
        status:SERVER_STATUS.BAD_REQUEST,
        successful:false,
        message:"Group full already.",
        
      })
      return 

            }

            console.log(`group${members}:${user._id}`)

            //check if you are already  member
          if(members.find(member=>member.id === user._id)){
         res.status(SERVER_STATUS.BAD_REQUEST).json({
        title:'Join Group By Invitation Message',
        status:SERVER_STATUS.BAD_REQUEST,
        successful:false,
        message:"Already a group member.",
        
      })
         return

        }


          members.push({
            id:user,
            isAdmin:false
          })
            group = await newGroupModel.findOneAndUpdate({_id:group._id},{members})

         res.status(SERVER_STATUS.SUCCESS).json({
        title:'Join Group By Invitation Message',
        status:SERVER_STATUS.SUCCESS,
        successful:true,
        message:"Successfully join group by invitation.",
        
      })

      return
      }

        


        

       res.status(SERVER_STATUS.BAD_REQUEST).json({
        title:'Join Group By Invitation Message',
        status:SERVER_STATUS.BAD_REQUEST,
        successful:false,
        message:"Invalid group link",
     
      })

   
     
    
    }catch(e:any){

   res.status(SERVER_STATUS.INTERNAL_SERVER_ERROR).json({
        title:'Join Group By Invitation Message',
        status:SERVER_STATUS.INTERNAL_SERVER_ERROR,
        successful:false,
        message:"New group creation failed",
        error:e.message
      })
        
    }



}




export const joinGroup = async (req:TypedRequest<{}>,res:TypedResponse<ResponseBodyProps>) =>{

  

    try {

        const user = req.user

       

      
    } catch (error) {


      
    }

 



}



export const getMyGroups = async (req:TypedRequest<{}>,res:TypedResponse<ResponseBodyProps>) =>{

    const user = req.user

    try {
     
      const groups = await newGroupModel.find({'members.id':user._id}).populate('members.id',['email','first_name','last_name','profile_image_url','total_groups_completed'])

      if(groups){

         res.status(SERVER_STATUS.SUCCESS).json({
        title:'My Groups Message',
        status:SERVER_STATUS.SUCCESS,
        successful:true,
        message:"Groups fetched successfully",
        data:groups
     
      })

   return
      }


       res.status(SERVER_STATUS.SUCCESS).json({
        title:'My Groups Message',
        status:SERVER_STATUS.SUCCESS,
        successful:true,
        message:"No group joined or created",
     
      })


    } catch (error:any) {

        res.status(SERVER_STATUS.INTERNAL_SERVER_ERROR).json({
        title:'My Groups Message',
        status:SERVER_STATUS.INTERNAL_SERVER_ERROR,
        successful:false,
        message:"An error occured",
        error:error.message
     
      })
      
    }



}

export const getPublicGroups =  async (req:TypedRequest<{}>,res:TypedResponse<ResponseBodyProps>) =>{

    
    try{


    const publicGroups = await newGroupModel.find({is_public:true})

          res.status(SERVER_STATUS.SUCCESS).json({
                title:'Public Groups Message',
                status:SERVER_STATUS.SUCCESS,
                successful:true,
                message:'Public groups successfully fetched',
                data:publicGroups
            })
    
        


    } catch (e:any){
      res.status(SERVER_STATUS.INTERNAL_SERVER_ERROR).json({
                title:'Get Public Groups Message',
                status:SERVER_STATUS.INTERNAL_SERVER_ERROR,
                successful:false,
                message:'An error occured',
                error:e.message
            })
    
    }






}


export const getMyActiveGroups = async (req:TypedRequest<{}>,res:TypedResponse<ResponseBodyProps>) =>{

    const user = req.user

    try {

      
     
      const groups = await newGroupModel.find({'members.id':user._id,start_date:{$ne:null}}).populate('members.id',['email','first_name','last_name','profile_image_url','total_groups_completed'])


      
      if(groups){

         res.status(SERVER_STATUS.SUCCESS).json({
        title:'My Groups Message',
        status:SERVER_STATUS.SUCCESS,
        successful:true,
        message:"Groups fetched successfully",
        data:groups
     
      })

   return
      }


       res.status(SERVER_STATUS.SUCCESS).json({
        title:'My Active Groups Message',
        status:SERVER_STATUS.SUCCESS,
        successful:true,
        message:"No Active groups yet",
     
      })


    } catch (error:any) {

        res.status(SERVER_STATUS.INTERNAL_SERVER_ERROR).json({
        title:'My Active Groups Message',
        status:SERVER_STATUS.INTERNAL_SERVER_ERROR,
        successful:false,
        message:"An error occured",
        error:error.message
     
      })
      
    }



}






