import express from 'express'
import { protect } from '../middleware/auth.js'
import { getComments, addComment, deleteComment, toggleCommentLike } from '../controllers/comment.controller.js'

const router = express.Router()
router.use(protect)

router.get('/:postId', getComments)
router.post('/like/:commentId', toggleCommentLike)
router.post('/:postId', addComment)
router.delete('/:commentId', deleteComment)

export default router