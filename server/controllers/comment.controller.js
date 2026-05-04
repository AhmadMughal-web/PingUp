import Comment from '../models/Comment.model.js'
import Post from '../models/Post.model.js'
import { createNotification } from './notification.controller.js'

const populateUser = '_id full_name username profile_picture is_verified'

// GET /api/comments/:postId
export const getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.postId })
      .sort({ createdAt: -1 })
      .populate('user', '_id full_name username profile_picture is_verified')
      .populate('reply_to', 'text user')
    res.json({ success: true, comments })
  } catch (err) {
    console.error('getComments error:', err.message)
    res.status(500).json({ success: false, message: err.message })
  }
}

// POST /api/comments/:postId
export const addComment = async (req, res) => {
  try {
    const { text, reply_to, reply_to_user } = req.body
    if (!text?.trim()) return res.status(400).json({ success: false, message: 'Comment cannot be empty' })

    const post = await Post.findById(req.params.postId)
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' })

    const comment = await Comment.create({
      post: req.params.postId,
      user: req.user._id,
      text,
      reply_to: reply_to || null,
      reply_to_user: reply_to_user || '',
    })
    await comment.populate('user', populateUser)
    await Post.findByIdAndUpdate(req.params.postId, { $inc: { comments_count: 1 } })

    createNotification({ recipient: post.user, sender: req.user._id, type: 'comment', post: post._id, comment: comment._id })

    if (reply_to) {
      const parentComment = await Comment.findById(reply_to)
      if (parentComment) {
        createNotification({ recipient: parentComment.user, sender: req.user._id, type: 'reply', post: post._id, comment: comment._id })
      }
    }

    res.status(201).json({ success: true, comment })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// POST /api/comments/like/:commentId
export const toggleCommentLike = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId)
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' })

    const alreadyLiked = comment.likes.map(String).includes(req.user._id.toString())
    if (alreadyLiked) {
      comment.likes.pull(req.user._id)
    } else {
      comment.likes.push(req.user._id)
    }
    await comment.save()
    res.json({ success: true, likes: comment.likes })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// DELETE /api/comments/:commentId
export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findOne({ _id: req.params.commentId, user: req.user._id })
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' })

    await Post.findByIdAndUpdate(comment.post, { $inc: { comments_count: -1 } })
    await comment.deleteOne()

    res.json({ success: true, message: 'Comment deleted' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}