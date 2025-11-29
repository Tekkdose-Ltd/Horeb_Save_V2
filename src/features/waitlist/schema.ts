
import z from "zod"



export const waitlistValidationSchema = z.object({


first_name:z.string().nonempty(),
last_name:z.string().nonempty(),
email:z.email().nonempty(),
phone_number:z.string().regex(new RegExp(/^\+[1-9]\d{10,14}$/),'Invalid form number provided'),
saving_method:z.string().nonempty(),
income_pattern:z.string().nonempty(),
priority:z.string().nonempty(),
goal:z.string().nonempty(),
early_access:z.string().nonempty()
})



