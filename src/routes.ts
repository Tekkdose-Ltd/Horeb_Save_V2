import express from 'express'
import accountRouter from './features/auth/account/route/accountRoute'
import groupsRouter from './features/groups/route/groups'
import waitlistRouter from './features/waitlist/routes/waitlist'


const mainAppRouter =  express.Router()


mainAppRouter.use('/auth',accountRouter)

mainAppRouter.use('/groups',groupsRouter)

mainAppRouter.use('/waitlist',waitlistRouter)

export default mainAppRouter