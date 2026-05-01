import express from 'express'
import { protect } from '../middleware/auth.js'
import {
  getMe, getUserById, updateProfile, updateProfilePicture,
  updateCoverPhoto, toggleFollow, getFollowers, getFollowing, discoverUsers
} from '../controllers/user.controller.js'
import { createUploader } from '../config/cloudinary.js'

const router = express.Router()
const profileUploader = createUploader('profiles')
const coverUploader = createUploader('covers')

router.use(protect)

router.get('/me', getMe)
router.get('/discover', discoverUsers)
router.get('/followers/:id', getFollowers)
router.get('/following/:id', getFollowing)
router.get('/:id', getUserById)
router.put('/update-profile', updateProfile)
router.put('/update-profile-picture', profileUploader.single('profile_picture'), updateProfilePicture)
router.put('/update-cover-photo', coverUploader.single('cover_photo'), updateCoverPhoto)
router.post('/follow/:targetId', toggleFollow)

export default router
