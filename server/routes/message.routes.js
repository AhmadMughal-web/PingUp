import express from 'express'
import { protect } from '../middleware/auth.js'
import { createUploader } from '../config/cloudinary.js'
import { getInbox, getConversation, sendMessage, getRecentMessages, deleteMessage } from '../controllers/message.controller.js'

const router = express.Router()

const messageUploader = createUploader('messages')

router.use(protect)

router.get('/', getInbox)
router.get('/recent', getRecentMessages)
router.post('/send', messageUploader.single('image'), sendMessage)
router.delete('/:messageId', deleteMessage)
router.get('/:partnerId', getConversation)

export default router
