import express from 'express'
import { protect } from '../middleware/auth.js'
import {
  getFollowers,
  getFollowing,
  getConnections,
  getPendingConnections,
  getSuggestions,
} from '../controllers/connection.controller.js'
 
const router = express.Router()
 
router.use(protect)
 
router.get('/followers', getFollowers)
router.get('/following', getFollowing)
router.get('/connections', getConnections)
router.get('/pending', getPendingConnections)
router.get('/suggestions', getSuggestions)
 
export default router
 