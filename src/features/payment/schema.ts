import zod from "zod";

export const contributionValidationSchema = zod.object({

   group_id:zod.string().nonempty(),
   
   member_id:zod.string().nonempty(),

   amount:zod.number().min(1)

 

})