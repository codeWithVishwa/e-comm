import {Router} from 'express'
import auth from '../middleware/auth.js'
import { DeleteMessage, GetMessagesForAdmin, SendMessageToAdmin, UpdateMessageStatus } from '../controllers/message.controller.js'
import { adminCheck } from '../middleware/admin.auth.js'

const MessageRouter=Router()

MessageRouter.post('/send',auth,SendMessageToAdmin)
MessageRouter.get('/get',auth,adminCheck,GetMessagesForAdmin)
MessageRouter.patch('/update-status/:messageId',auth,adminCheck,UpdateMessageStatus)
MessageRouter.delete('/delete/:messageId',auth,adminCheck,DeleteMessage)

export default MessageRouter