import express from 'express'
import { protect } from '../middleware/auth.js'
import { storyUploader } from '../config/cloudinary.js'
import {
  createStory,
  getStories,
  viewStory,
  deleteStory,
} from '../controllers/story.controller.js'

const router = express.Router()

router.use(protect)

router.get('/', getStories)
router.post('/create', storyUploader().single('media'), createStory)
router.post('/view/:storyId', viewStory)
router.delete('/:storyId', deleteStory)

export default router
