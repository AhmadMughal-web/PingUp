import express from 'express'
import { protect } from '../middleware/auth.js'
import { createUploader } from '../config/cloudinary.js'
import {
  createPost,
  getFeed,
  getUserPosts,
  toggleLike,
  deletePost,
  toggleVisibility,
} from '../controllers/post.controller.js'

const router = express.Router()
const postUploader = createUploader('posts')

router.use(protect)

router.get('/feed', getFeed)
router.get('/user/:userId', getUserPosts)
router.post('/create', postUploader.array('images', 5), createPost)
router.post('/like/:postId', toggleLike)
router.patch('/:postId/visibility', toggleVisibility)
router.delete('/:postId', deletePost)

export default router