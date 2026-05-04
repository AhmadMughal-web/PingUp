import express from 'express'
import { protect } from '../middleware/auth.js'
import { getNotifications, getUnreadCount, markAllRead, markOneRead } from '../controllers/notification.controller.js'

const router = express.Router()
router.use(protect)

router.get('/', getNotifications)
router.get('/unread-count', getUnreadCount)
router.put('/mark-all-read', markAllRead)
router.put('/:notificationId/read', markOneRead)

export default router
