import zod from 'zod'

export const CreateNewAccountValidationSchema = zod.object({
    email:zod.email().nonempty(),
    password:zod.string().nonempty(),
    first_name:zod.string().min(2).max(30).nonempty(),
    last_name:zod.string().min(2).max(30).nonempty(),
    profile_image_url:zod.string(),
    phone_number:zod.string().regex(new RegExp(/^\+[1-9]\d{10,14}$/),'Invalid form number provided'),
    date_of_birth:zod.date(),
    address_line_1:zod.string(),
    address_line_2:zod.string(),
    city:zod.string(),
    postalCode:zod.string(),
    country:zod.string(),
    profile_completed:zod.boolean().optional(),
    stripe_customer_id:zod.string().optional(),
    trust_score:zod.number().positive().optional(),
    total_groups_completed:zod.number().optional(),
    on_time_payment_rate:zod.number().optional()
    


})


 export type createCreateNewAccountInput = zod.infer<typeof CreateNewAccountValidationSchema>

 