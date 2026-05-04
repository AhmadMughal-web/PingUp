import Message from '../models/Message.model.js'
import User from '../models/User.model.js'
import { getSocketId, io } from '../server.js'
import { deleteFromCloudinary } from '../config/cloudinary.js'
import { createNotification } from './notification.controller.js'

// GET /api/messages  — inbox (last message per conversation)
export const getInbox = async (req, res) => {
  try {
    const myId = req.user._id
    const messages = await Message.find({
      $or: [{ from_user: myId }, { to_user: myId }],
    }).sort({ createdAt: -1 })

    const seen = new Set()
    const convos = []
    for (const msg of messages) {
      const partnerId = msg.from_user.toString() === myId.toString()
        ? msg.to_user.toString()
        : msg.from_user.toString()
      if (!seen.has(partnerId)) {
        seen.add(partnerId)
        convos.push({ partnerId, lastMessage: msg })
      }
    }
    const partners = await User.find({ _id: { $in: [...seen] } })
      .select('_id full_name username profile_picture')
    const partnerMap = {}
    partners.forEach((p) => { partnerMap[p._id.toString()] = p })

    const inbox = convos.map((c) => ({ user: partnerMap[c.partnerId], lastMessage: c.lastMessage }))
    res.json({ success: true, inbox })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// GET /api/messages/recent — last 5 for sidebar widget
export const getRecentMessages = async (req, res) => {
  try {
    const myId = req.user._id

    // Sirf wo messages jo doosron ne mujhe bheje hain
    const messages = await Message.find({
      to_user: myId  // sirf received messages
    }).sort({ createdAt: -1 }).limit(20)

    const seen = new Set()
    const recent = []
    for (const msg of messages) {
      const partnerId = msg.from_user.toString()
      if (!seen.has(partnerId)) {
        seen.add(partnerId)
        recent.push({ partnerId, lastMessage: msg })
        if (recent.length === 5) break
      }
    }

    const partners = await User.find({ _id: { $in: [...seen] } })
      .select('_id full_name username profile_picture')
    const partnerMap = {}
    partners.forEach((p) => { partnerMap[p._id.toString()] = p })

    // Count unread messages per partner
    const unreadCounts = {}
    for (const msg of messages) {
      const partnerId = msg.from_user.toString()
      if (!msg.seen) {
        unreadCounts[partnerId] = (unreadCounts[partnerId] || 0) + 1
      }
    }

    const recentMessages = recent.map((r) => ({
      user: partnerMap[r.partnerId],
      lastMessage: r.lastMessage,
      unreadCount: unreadCounts[r.partnerId] || 0,
    }))
    res.json({ success: true, recentMessages })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// GET /api/messages/:partnerId
export const getConversation = async (req, res) => {
  try {
    const myId = req.user._id
    const partnerId = req.params.partnerId
    const page = parseInt(req.query.page) || 1
    const limit = 30

    const partner = await User.findById(partnerId).select('_id full_name username profile_picture')
    if (!partner) return res.status(404).json({ success: false, message: 'User not found' })

    const messages = await Message.find({
      $or: [
        { from_user: myId, to_user: partnerId },
        { from_user: partnerId, to_user: myId },
      ],
    })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)

    // Mark as seen
    const unseenMessages = await Message.find({ from_user: partnerId, to_user: myId, seen: false })
    if (unseenMessages.length > 0) {
      await Message.updateMany(
        { from_user: partnerId, to_user: myId, seen: false },
        { $set: { seen: true } }
      )
      // Partner ko batao ke messages seen ho gaye
      const { getSocketId, io } = await import('../server.js')
      const partnerSocketId = getSocketId(partnerId)
      if (partnerSocketId) {
        io.to(partnerSocketId).emit('messages:seen', { from_user_id: myId })
      }
    }

    res.json({ success: true, messages: messages.reverse(), partner })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// POST /api/messages/send
export const sendMessage = async (req, res) => {
  try {
    const { to_user_id, text } = req.body
    const file = req.file

    const recipient = await User.findById(to_user_id)
    if (!recipient) return res.status(404).json({ success: false, message: 'Recipient not found' })

    let media_url = '', media_public_id = '', message_type = 'text'
    if (file) {
      media_url = file.path
      media_public_id = file.filename
      message_type = 'image'
    }

    const message = await Message.create({
      from_user: req.user._id,
      to_user: to_user_id,
      text: text || '',
      media_url,
      media_public_id,
      message_type,
    })

    // Real-time delivery via Socket.IO
    const notifType = req.body.is_story_reply === 'true' ? 'story_reply' : 'message'
    createNotification({ recipient: to_user_id, sender: req.user._id, type: notifType })
    const recipientSocketId = getSocketId(to_user_id)
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('message:new', message)
    }

    res.status(201).json({ success: true, message })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// DELETE /api/messages/:messageId
export const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findOne({ _id: req.params.messageId, from_user: req.user._id })
    if (!message) return res.status(404).json({ success: false, message: 'Message not found' })
    await message.deleteOne()
    res.json({ success: true, message: 'Message deleted' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}