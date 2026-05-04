import mongoose from 'mongoose'

const storySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, maxlength: 500, default: '' },
    media_url: { type: String, default: '' },
    media_public_id: { type: String, default: '' },
    media_type: { type: String, enum: ['text', 'image', 'video'], default: 'text' },
    background_color: { type: String, default: '#4f46e5' },
    views: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    expires_at: { type: Date, default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) },
  },
  { timestamps: true }
)

storySchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 })

const Story = mongoose.model('Story', storySchema)
export default Story
