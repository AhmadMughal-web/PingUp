import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import morgan from 'morgan'
import { connectDB } from './config/db.js'

import authRoutes from './routes/auth.routes.js'
import userRoutes from './routes/user.routes.js'
import postRoutes from './routes/post.routes.js'
import storyRoutes from './routes/story.routes.js'
import messageRoutes from './routes/message.routes.js'
import connectionRoutes from './routes/connection.routes.js'
import commentRoutes from './routes/comment.routes.js'

const app = express()
const httpServer = createServer(app)

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || origin.startsWith('http://localhost') || origin === process.env.CLIENT_URL) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
}

export const io = new Server(httpServer, { cors: corsOptions })

const onlineUsers = new Map()
io.on('connection', (socket) => {
  const userId = socket.handshake.query.userId
  if (userId) {
    onlineUsers.set(userId, socket.id)
    io.emit('user:online', { userId })
  }
  socket.on('disconnect', () => {
    if (userId) {
      onlineUsers.delete(userId)
      io.emit('user:offline', { userId })
    }
  })
})
export const getSocketId = (userId) => onlineUsers.get(userId)

app.use(cors(corsOptions))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(morgan('dev'))

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/posts', postRoutes)
app.use('/api/stories', storyRoutes)
app.use('/api/messages', messageRoutes)
app.use('/api/connections', connectionRoutes)
app.use('/api/comments', commentRoutes)

app.get('/api/health', (_, res) => res.json({ status: 'ok' }))

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ success: false, message: 'Server error' })
})

const PORT = process.env.PORT || 5000
connectDB().then(() => {
  httpServer.listen(PORT, () => console.log(`✅ PingUp server running on port ${PORT}`))
})
