import {Router} from 'express'
import auth from '../middleware/auth.js'
import { adminCheck } from '../middleware/admin.auth.js'
import { getAllUserDataForAdmin, getUserDetailedData, updateUserStatus } from '../controllers/adminuser.controller.js'

const Adminrouter=Router()

Adminrouter.get('/users',auth,adminCheck,getAllUserDataForAdmin)
Adminrouter.get('/users/:userId',auth,adminCheck,getUserDetailedData)
Adminrouter.put('/users/:userId/status',auth,adminCheck,updateUserStatus)

export default Adminrouter