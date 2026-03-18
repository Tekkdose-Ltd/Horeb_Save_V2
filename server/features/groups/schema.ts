import zod from "zod";



export const createNewGroupValidationSchema =  zod.object({
   

    name:zod.string().nonempty(),
   
    

     
     description: zod.string().nonempty(),
     
     
   frequency:zod.enum(['hourly', 'weekly', 'monthly','bi-weekly']),
     
      contribution_amount:zod.number().gte(100),
     
   
   max_number_of_members:zod.number().gte(3),
       
      is_public:zod.boolean()
   


})


export const joinGroupValidationSchema =  zod.object({
   

   invite_code:zod.string().min(10).nonempty(),
   
   

   

})


export const newGroupTrustRatingValidationSchema = zod.object({

   group_id:zod.string().nonempty(),
   
   group_member_id:zod.string().nonempty(),

   rating_score:zod.number().min(1).max(5),

   description:zod.string().optional()

})

