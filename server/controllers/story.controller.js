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
    const story = await Story.findById(req.params.storyId)
    if (!story) return res.status(404).json({ success: false, message: 'Story not found' })

    // Owner ka view count nahi hoga
    if (story.user.toString() !== req.user._id.toString()) {
      await Story.findByIdAndUpdate(req.params.storyId, { $addToSet: { views: req.user._id } })
    }

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

// POST /api/stories/like/:storyId
export const likeStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.storyId)
    if (!story) return res.status(404).json({ success: false, message: 'Story not found' })

    // Owner apni story like nahi kar sakta
    if (story.user.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot like your own story' })
    }

    const alreadyLiked = story.likes.map(String).includes(req.user._id.toString())
    if (alreadyLiked) {
      story.likes = story.likes.filter(id => id.toString() !== req.user._id.toString())
    } else {
      story.likes.push(req.user._id)
    }
    await story.save()
    res.json({ success: true, likes: story.likes })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// GET /api/stories/viewers/:storyId
export const getStoryViewers = async (req, res) => {
  try {
    const story = await Story.findById(req.params.storyId)
      .populate('views', '_id full_name username profile_picture')
      .populate('likes', '_id full_name username profile_picture')
    if (!story) return res.status(404).json({ success: false, message: 'Story not found' })

    // Only story owner can see viewers
    if (story.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' })
    }

    res.json({ success: true, views: story.views, likes: story.likes })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}
