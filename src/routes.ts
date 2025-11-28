import express from 'express'
import accountRouter from './features/auth/account/route/accountRoute'
import groupsRouter from './features/groups/route/groups'


const mainAppRouter =  express.Router()


mainAppRouter.use('/auth',accountRouter)

mainAppRouter.use('/groups',groupsRouter)

export default mainAppRouter