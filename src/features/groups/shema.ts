import zod from "zod";



export const createNewGroupValidationSchema =  zod.object({
   

    name:zod.string().nonempty(),
   
    

     
     description: zod.string().nonempty(),
     
     
      frequency:zod.enum(['weekly', 'monthly','bi-weekly']),
     
      contribution_amount:zod.number(),
     
       total_round:zod.number(),
     
       is_public:zod.boolean()
   

})


export const joinGroupValidationSchema =  zod.object({
   

   group_id:zod.string().nonempty(),
   
   

   

})

