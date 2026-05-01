import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false, // never returned in queries by default
    },
    full_name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    username: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    bio: { type: String, maxlength: 300, default: '' },
    profile_picture: {
      url: { type: String, default: '' },
      public_id: { type: String, default: '' },
    },
    cover_photo: {
      url: { type: String, default: '' },
      public_id: { type: String, default: '' },
    },
    location: { type: String, maxlength: 100, default: '' },
    website: { type: String, maxlength: 200, default: '' },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    is_verified: { type: Boolean, default: false },
    is_private: { type: Boolean, default: false },
    reset_token: { type: String, select: false },
    reset_token_expiry: { type: Date, select: false },
  },
  { timestamps: true, toJSON: { virtuals: true } }
)

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

// Compare password
userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password)
}

userSchema.index({ full_name: 'text', username: 'text', bio: 'text' })

const User = mongoose.model('User', userSchema)
export default User
