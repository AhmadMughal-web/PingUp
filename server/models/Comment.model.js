import mongoose from 'mongoose'

const commentSchema = new mongoose.Schema(
  {
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, maxlength: 500, trim: true },
    content: { type: String, maxlength: 500, trim: true },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    reply_to: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null },
    reply_to_user: { type: String, default: '' }, // username for display
  },
  { timestamps: true }
)

const Comment = mongoose.model('Comment', commentSchema)
export default Comment