import Story from '../models/Story.model.js'
import { deleteFromCloudinary } from '../config/cloudinary.js'

// GET /api/stories
export const getStories = async (req, res) => {
  try {
    const following = [...req.user.following, req.user._id]
    const stories = await Story.find({
      user: { $in: following },
      expires_at: { $gt: new Date() },
    })
      .sort({ createdAt: -1 })
      .populate('user', '_id full_name username profile_picture is_verified')
    res.json({ success: true, stories })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// POST /api/stories/create
export const createStory = async (req, res) => {
  try {
    const { content, background_color } = req.body
    const file = req.file
    let media_url = '', media_public_id = '', media_type = 'text'
    if (file) {
      media_url = file.path
      media_public_id = file.filename
      media_type = file.mimetype.startsWith('video') ? 'video' : 'image'
    }
    const story = await Story.create({
      user: req.user._id, content, background_color, media_url, media_public_id, media_type,
    })
    await story.populate('user', '_id full_name username profile_picture is_verified')
    res.status(201).json({ success: true, story })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// POST /api/stories/view/:storyId
export const viewStory = async (req, res) => {
  try {
    await Story.findByIdAndUpdate(req.params.storyId, { $addToSet: { views: req.user._id } })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// DELETE /api/stories/:storyId
export const deleteStory = async (req, res) => {
  try {
    const story = await Story.findOne({ _id: req.params.storyId, user: req.user._id })
    if (!story) return res.status(404).json({ success: false, message: 'Story not found' })
    if (story.media_public_id) await deleteFromCloudinary(story.media_public_id)
    await story.deleteOne()
    res.json({ success: true, message: 'Story deleted' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}
