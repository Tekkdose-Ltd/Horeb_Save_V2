import swaggerJsDoc from 'swagger-jsdoc'

  const options = {
    definition:{
        openapi:'3.0.0',
        info:{
            title:"Horeb Save Api Doc",
            version:'1.0.0',
        },
        components:{
   securitySchemes:{
    bearerAuth:{
        type:'http',
        scheme:'bearer',
        bearerFormat:'JWT'
    },
   },
        },
    security:[
        {
            bearerAuth:[]
        }
    ],
    },
    apis:['./src/swagger-api/*.ts','./src/features/auth/account/route/accountRoute.ts','./src/features/groups/route/groups.ts',
        './src/features/waitlist/routes/waitlist.ts','./src/features/payment/routes.ts'
    ]
}

export default swaggerJsDoc(options)