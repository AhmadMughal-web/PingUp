import express from 'express'
import { protect } from '../middleware/auth.js'
import { storyUploader } from '../config/cloudinary.js'
import { getStories, createStory, viewStory, likeStory, getStoryViewers, deleteStory } from '../controllers/story.controller.js'

const router = express.Router()
router.use(protect)

router.get('/', getStories)
router.get('/viewers/:storyId', getStoryViewers)
router.post('/create', storyUploader().single('media'), createStory)
router.post('/view/:storyId', viewStory)
router.post('/like/:storyId', likeStory)
router.delete('/:storyId', deleteStory)

export default router
