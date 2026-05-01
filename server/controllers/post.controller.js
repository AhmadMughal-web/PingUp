import Post from '../models/Post.model.js'
import { deleteFromCloudinary } from '../config/cloudinary.js'

// GET /api/posts/feed?page=
export const getFeed = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = 10
    const skip = (page - 1) * limit
    const following = [...req.user.following, req.user._id]

    const posts = await Post.find({ user: { $in: following } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit + 1)
      .populate('user', '_id full_name username profile_picture is_verified')

    const hasMore = posts.length > limit
    res.json({ success: true, posts: posts.slice(0, limit), hasMore })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// GET /api/posts/user/:userId
export const getUserPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = 12
    const posts = await Post.find({ user: req.params.userId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('user', '_id full_name username profile_picture is_verified')
    res.json({ success: true, posts })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// POST /api/posts/create (multipart)
export const createPost = async (req, res) => {
  try {
    const { content } = req.body
    const files = req.files || []
    if (!content?.trim() && files.length === 0) {
      return res.status(400).json({ success: false, message: 'Post cannot be empty' })
    }
    const image_urls = files.map((f) => ({ url: f.path, public_id: f.filename }))
    const post = await Post.create({ user: req.user._id, content, image_urls })
    await post.populate('user', '_id full_name username profile_picture is_verified')
    res.status(201).json({ success: true, post })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// POST /api/posts/like/:postId
export const toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId)
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' })

    const alreadyLiked = post.likes_count.map(String).includes(req.user._id.toString())
    if (alreadyLiked) {
      post.likes_count.pull(req.user._id)
    } else {
      post.likes_count.push(req.user._id)
    }
    await post.save()
    res.json({ success: true, likes_count: post.likes_count })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// DELETE /api/posts/:postId
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.postId, user: req.user._id })
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' })
    for (const img of post.image_urls) {
      if (img.public_id) await deleteFromCloudinary(img.public_id)
    }
    post.is_deleted = true
    await post.save()
    res.json({ success: true, message: 'Post deleted' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// PATCH /api/posts/:postId/visibility
export const toggleVisibility = async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.postId, user: req.user._id })
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' })
    post.is_private = !post.is_private
    await post.save()
    res.json({ success: true, is_private: post.is_private })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}
