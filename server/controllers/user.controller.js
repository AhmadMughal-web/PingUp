import User from '../models/User.model.js'
import { deleteFromCloudinary, createUploader } from '../config/cloudinary.js'

// GET /api/users/me
export const getMe = async (req, res) => {
  res.json({ success: true, user: req.user })
}

// GET /api/users/:id
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password')
    if (!user) return res.status(404).json({ success: false, message: 'User not found' })
    res.json({ success: true, user })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// PUT /api/users/update-profile
export const updateProfile = async (req, res) => {
  try {
    const { full_name, username, bio, location, website } = req.body
    if (username) {
      const exists = await User.findOne({ username, _id: { $ne: req.user._id } })
      if (exists) return res.status(400).json({ success: false, message: 'Username already taken' })
    }
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { full_name, username, bio, location, website } },
      { new: true }
    ).select('-password')
    res.json({ success: true, user })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// PUT /api/users/update-profile-picture  (multipart)
export const updateProfilePicture = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' })
    if (req.user.profile_picture?.public_id) {
      await deleteFromCloudinary(req.user.profile_picture.public_id)
    }
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { profile_picture: { url: req.file.path, public_id: req.file.filename } } },
      { new: true }
    ).select('-password')
    res.json({ success: true, user })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// PUT /api/users/update-cover-photo  (multipart)
export const updateCoverPhoto = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' })
    if (req.user.cover_photo?.public_id) {
      await deleteFromCloudinary(req.user.cover_photo.public_id)
    }
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { cover_photo: { url: req.file.path, public_id: req.file.filename } } },
      { new: true }
    ).select('-password')
    res.json({ success: true, user })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// POST /api/users/follow/:targetId
export const toggleFollow = async (req, res) => {
  try {
    const myId = req.user._id
    const targetId = req.params.targetId
    if (myId.toString() === targetId) {
      return res.status(400).json({ success: false, message: "You can't follow yourself" })
    }
    const targetUser = await User.findById(targetId)
    if (!targetUser) return res.status(404).json({ success: false, message: 'User not found' })

    const isFollowing = req.user.following.map(String).includes(targetId)

    if (isFollowing) {
      await User.findByIdAndUpdate(myId, { $pull: { following: targetId } })
      await User.findByIdAndUpdate(targetId, { $pull: { followers: myId } })
      res.json({ success: true, action: 'unfollowed' })
    } else {
      await User.findByIdAndUpdate(myId, { $addToSet: { following: targetId } })
      await User.findByIdAndUpdate(targetId, { $addToSet: { followers: myId } })
      res.json({ success: true, action: 'followed' })
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// GET /api/users/followers/:id
export const getFollowers = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate(
      'followers', '_id full_name username profile_picture bio is_verified'
    )
    if (!user) return res.status(404).json({ success: false, message: 'User not found' })
    res.json({ success: true, followers: user.followers })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// GET /api/users/following/:id
export const getFollowing = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate(
      'following', '_id full_name username profile_picture bio is_verified'
    )
    if (!user) return res.status(404).json({ success: false, message: 'User not found' })
    res.json({ success: true, following: user.following })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// GET /api/users/discover?q=&page=
export const discoverUsers = async (req, res) => {
  try {
    const { q = '', page = 1 } = req.query
    const limit = 20
    const skip = (page - 1) * limit
    const filter = {
      _id: { $ne: req.user._id },
      ...(q ? { $text: { $search: q } } : {}),
    }
    const users = await User.find(filter)
      .select('_id full_name username profile_picture bio location is_verified followers')
      .skip(skip)
      .limit(limit)
    res.json({ success: true, users })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}
