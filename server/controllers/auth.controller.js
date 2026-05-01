import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import User from '../models/User.model.js'

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' })

// POST /api/auth/signup
export const signup = async (req, res) => {
  try {
    const { full_name, email, password } = req.body

    if (!full_name || !email || !password)
      return res.status(400).json({ success: false, message: 'All fields are required' })

    if (password.length < 6)
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' })

    const existing = await User.findOne({ email })
    if (existing)
      return res.status(400).json({ success: false, message: 'Email already registered' })

    // Auto-generate username from name
    const baseUsername = full_name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
    const random = Math.floor(1000 + Math.random() * 9000)
    const username = `${baseUsername}_${random}`

    const user = await User.create({ full_name, email, password, username })
    const token = generateToken(user._id)

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        full_name: user.full_name,
        email: user.email,
        username: user.username,
        profile_picture: user.profile_picture,
        bio: user.bio,
        location: user.location,
        followers: user.followers,
        following: user.following,
      },
    })
  } catch (err) {
    console.error('Signup error:', err)
    res.status(500).json({ success: false, message: 'Server error' })
  }
}

// POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email and password required' })

    const user = await User.findOne({ email }).select('+password')
    if (!user)
      return res.status(400).json({ success: false, message: 'Invalid email or password' })

    const isMatch = await user.comparePassword(password)
    if (!isMatch)
      return res.status(400).json({ success: false, message: 'Invalid email or password' })

    const token = generateToken(user._id)

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        full_name: user.full_name,
        email: user.email,
        username: user.username,
        profile_picture: user.profile_picture,
        cover_photo: user.cover_photo,
        bio: user.bio,
        location: user.location,
        followers: user.followers,
        following: user.following,
        is_verified: user.is_verified,
      },
    })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ success: false, message: 'Server error' })
  }
}

// POST /api/auth/forgot-password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body
    const user = await User.findOne({ email })

    // Always return success (don't reveal if email exists)
    if (!user) return res.json({ success: true, message: 'If this email exists, a reset link has been sent' })

    const token = crypto.randomBytes(32).toString('hex')
    user.reset_token = token
    user.reset_token_expiry = Date.now() + 1000 * 60 * 60 // 1 hour
    await user.save({ validateBeforeSave: false })

    // In production: send email with reset link
    // For now: return token in response (dev mode)
    console.log(`Password reset token for ${email}: ${token}`)

    res.json({
      success: true,
      message: 'Password reset link sent to your email',
      // Remove this in production:
      dev_token: token,
    })
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' })
  }
}

// POST /api/auth/reset-password
export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body

    if (!token || !password)
      return res.status(400).json({ success: false, message: 'Token and new password required' })

    const user = await User.findOne({
      reset_token: token,
      reset_token_expiry: { $gt: Date.now() },
    }).select('+password')

    if (!user)
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' })

    user.password = password
    user.reset_token = undefined
    user.reset_token_expiry = undefined
    await user.save()

    const jwtToken = generateToken(user._id)
    res.json({ success: true, message: 'Password reset successful', token: jwtToken })
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' })
  }
}

// GET /api/auth/me  (verify token + return user)
export const getMe = async (req, res) => {
  res.json({ success: true, user: req.user })
}
