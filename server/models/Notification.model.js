import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema(
    {
        recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        type: {
            type: String,
            enum: ['like_post', 'like_story', 'comment', 'reply', 'follow', 'message', 'story_reply'],
            required: true,
        },
        post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', default: null },
        story: { type: mongoose.Schema.Types.ObjectId, ref: 'Story', default: null },
        comment: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null },
        is_read: { type: Boolean, default: false },
    },
    { timestamps: true }
)

const Notification = mongoose.model('Notification', notificationSchema)
export default Notification
