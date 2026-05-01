import mongoose from 'mongoose'

const postSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    content: { type: String, maxlength: 2000, default: '' },
    image_urls: [{ url: String, public_id: String }],
    post_type: { type: String, enum: ['text', 'image', 'text_with_image'], default: 'text' },
    likes_count: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments_count: { type: Number, default: 0 },
    shares_count: { type: Number, default: 0 },
    hashtags: [String],
    is_private: { type: Boolean, default: false },
    is_deleted: { type: Boolean, default: false },
  },
  { timestamps: true }
)

postSchema.pre('save', function (next) {
  if (this.isModified('content') && this.content) {
    this.hashtags = (this.content.match(/#\w+/g) || []).map((t) => t.toLowerCase())
  }
  if (this.image_urls.length > 0 && this.content) this.post_type = 'text_with_image'
  else if (this.image_urls.length > 0) this.post_type = 'image'
  else this.post_type = 'text'
  next()
})

postSchema.pre(/^find/, function (next) {
  this.where({ is_deleted: false })
  next()
})

const Post = mongoose.model('Post', postSchema)
export default Post
