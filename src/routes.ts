import express from 'express'
import accountRouter from './features/auth/account/route/accountRoute'


const mainAppRouter =  express.Router()


mainAppRouter.use('/auth',accountRouter)

export default mainAppRouter