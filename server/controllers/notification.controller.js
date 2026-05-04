import Notification from '../models/Notification.model.js'

const populateSender = '_id full_name username profile_picture'

// GET /api/notifications
export const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user._id })
            .sort({ createdAt: -1 })
            .limit(50)
            .populate('sender', populateSender)
            .populate('post', '_id content image_urls')
            .populate('story', '_id content media_url')
            .populate('comment', '_id text')

        res.json({ success: true, notifications })
    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
}

// GET /api/notifications/unread-count
export const getUnreadCount = async (req, res) => {
    try {
        const count = await Notification.countDocuments({ recipient: req.user._id, is_read: false })
        res.json({ success: true, count })
    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
}

// PUT /api/notifications/mark-all-read
export const markAllRead = async (req, res) => {
    try {
        await Notification.updateMany({ recipient: req.user._id, is_read: false }, { $set: { is_read: true } })
        res.json({ success: true })
    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
}

// Helper — call this from other controllers to create notifications
export const createNotification = async ({ recipient, sender, type, post, story, comment }) => {
    try {
        // Don't notify yourself
        if (recipient.toString() === sender.toString()) return

        // Message notifications pe duplicate check mat karo — har message alag notification
        if (type !== 'message' && type !== 'story_reply') {
            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
            const existing = await Notification.findOne({
                recipient, sender, type,
                ...(post && { post }),
                createdAt: { $gt: oneHourAgo }
            })
            if (existing) return
        }

        await Notification.create({ recipient, sender, type, post: post || null, story: story || null, comment: comment || null })
    } catch (err) {
        console.error('Notification creation error:', err.message)
    }
}

// PUT /api/notifications/:notificationId/read
export const markOneRead = async (req, res) => {
    try {
        await Notification.findOneAndUpdate(
            { _id: req.params.notificationId, recipient: req.user._id },
            { $set: { is_read: true } }
        )
        res.json({ success: true })
    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
}
