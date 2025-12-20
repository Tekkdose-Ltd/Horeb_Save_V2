import zod, { z } from 'zod'

export const CreateNewAccountValidationSchema = zod.object({
    email:zod.email().nonempty(),
    surety_email:zod.email().nonempty(),
    password:zod.string().nonempty(),
    first_name:zod.string().min(2).max(30).nonempty(),
    last_name:zod.string().min(2).max(30).nonempty(),
    profile_image_url:zod.string(),
    phone_number:zod.string().regex(new RegExp(/^\+[1-9]\d{10,14}$/),'Invalid form number provided'),
    date_of_birth:zod.string(),
    address_line_1:zod.string(),
    address_line_2:zod.string(),
    city:zod.string(),
    postalCode:zod.string(),
    country:zod.enum([
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda",
  "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", 
  "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", 
  "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", 
  "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", 
  "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", 
  "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba", 
  "Cyprus", "Czechia", "Democratic Republic of the Congo", 
  "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", 
  "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", 
  "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", 
  "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", 
  "Guyana", "Haiti", "Holy See", "Honduras", "Hungary", "Iceland", "India", 
  "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Ivory Coast", 
  "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait", 
  "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", 
  "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", 
  "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", 
  "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", 
  "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", 
  "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", 
  "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Palestine State", 
  "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", 
  "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", 
  "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", 
  "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", 
  "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", 
  "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", 
  "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Tajikistan", 
  "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", 
  "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", 
  "United Arab Emirates", "United Kingdom", "United States of America", 
  "Uruguay", "Uzbekistan", "Vanuatu", "Venezuela", "Vietnam", "Yemen", 
  "Zambia", "Zimbabwe"
]),
    profile_completed:zod.boolean().optional(),
    stripe_customer_id:zod.string().optional(),
    trust_score:zod.number().positive().optional(),
    total_groups_completed:zod.number().optional(),
    on_time_payment_rate:zod.number().optional()
    


})

export const LoginAccountValidationSchema = zod.object({
    email:zod.email().nonempty(),
    password:zod.string().nonempty()
})

export const refreshTokenValidationSchema = zod.object({
    token:zod.string().nonempty().min(10),
    user_id:zod.string().min(24)
})


export const updateUserDetailsValidationSchema =  zod.object({
    first_name:zod.string().min(2).max(30).nonempty(),
    last_name:zod.string().min(2).max(30).nonempty(),
    profile_image_url:zod.string().optional(),
    phone_number:zod.string().regex(new RegExp(/^\+[1-9]\d{10,14}$/),'Invalid form number provided').optional(),
    date_of_birth:zod.string().optional(),
    address_line_1:zod.string().optional(),
    address_line_2:zod.string().optional(),
    city:zod.string().optional(),
    postalCode:zod.string().optional(),
   
    


})

 export type createCreateNewAccountInput = zod.infer<typeof CreateNewAccountValidationSchema>

 