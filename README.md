# ⚡ PingUp — Full Stack Social Media Platform

> A production-ready social media platform built from scratch with real-time messaging, stories, notifications, and a complete authentication system — no third-party auth shortcuts.

[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-19-blue)](https://react.dev)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)](https://mongodb.com)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.7-black)](https://socket.io)

---

## 🚀 Live Demo

> **URL:** https://pingup-social-media-platform.netlify.app 

---

## 📸 What Is PingUp?

PingUp is a fully functional social media platform — think Instagram meets Twitter meets WhatsApp — built entirely by one developer. Every feature you see on major social platforms is implemented here: real-time chat, story reactions, nested comments, notification system, follow/unfollow, content moderation, and more.

---

## ✨ Features

### 🔐 Authentication System
- Custom JWT-based authentication (no Clerk, no Firebase — built from scratch)
- Secure signup with bcrypt password hashing (12 salt rounds)
- Login with persistent sessions via localStorage
- Forgot password & reset password flow with secure token expiry
- Auto-generated unique usernames on signup
- Protected routes — unauthenticated users redirected to login

### 👤 User Profiles
- Editable profile: full name, username, bio, location
- Profile picture upload (Cloudinary CDN)
- Cover photo upload
- Followers / Following / Connections count
- Posts count
- Joined date display
- Verified badge support
- View other users' profiles
- Follow / Unfollow / Follow Back buttons with real-time count updates
- Mutual follow = Connection system

### 📝 Posts
- Create posts with text and up to 5 images
- Hashtag detection and highlighting (`#tag` → clickable purple text)
- Like / Unlike with optimistic UI updates
- Real-time like count
- Comment section with lazy loading
- Share post — native share sheet on mobile, clipboard copy on desktop
- Post visibility toggle: **Public** / **Private**
- Delete own posts (soft delete)
- 3-dot menu on own posts only
- Infinite scroll feed
- Feed shows posts from followed users + own posts

### 💬 Comments
- Add comments on any post
- **Nested replies** — reply to any comment (Facebook-style threading)
- Like / Unlike individual comments with ThumbsUp indicator
- Delete own comments
- Reply indicator shows `@username` of parent comment author
- Comment count updates in real time
- Lazy loaded — only fetches when comment section is opened

### 📖 Stories
- Create stories: text, image, or video (up to 50MB video)
- Custom background colors for text stories
- Stories auto-expire after **24 hours** (MongoDB TTL index — no cron job)
- Story progress bar (10 second timer)
- **Navigate between stories** with left/right arrow buttons
- Like stories (only other users can like — not own story)
- **Reply to stories** → reply goes as direct message
- View story viewers list (own stories only)
- View who liked your story
- Delete own stories
- 3-dot menu inside story viewer
- Story viewer count updates after each view

### 💌 Real-Time Messaging (Socket.IO)
- One-on-one direct messaging
- Send text messages and images
- **Real-time delivery** via Socket.IO — no page refresh needed
- **Message status indicators** (WhatsApp-style):
  - ✓ Single tick — user is offline
  - ✓✓ Grey double tick — user is online
  - ✓✓ Blue double tick — message seen
- Delete own messages (hover to reveal 3-dot menu)
- Auto-scroll to latest message
- Recent Messages sidebar widget (shows received messages only)
- Unread message count badge

### 🔔 Notifications System
- Real-time notification bell with unread count badge in sidebar
- Notifications for:
  - ❤️ Someone liked your post
  - 💬 Someone commented on your post
  - ↩️ Someone replied to your comment
  - 👤 Someone followed you
  - 📩 Someone sent you a message
  - 💬 Someone replied to your story
  - ❤️ Someone liked your story
- Click any notification → navigates to relevant page
- Comment/Reply notifications → opens post with comment section expanded
- Individual notification mark as read (dot disappears on click)
- Mark all as read button
- Duplicate notification prevention (within 1 hour per action)

### 👥 Connections
- **4-tab connection management:**
  - **Followers** — who follows you
  - **Following** — who you follow
  - **Pending** — followers you haven't followed back
  - **Connections** — mutual follows (friends)
- Follow Back button on Pending tab
- Unfollow button on Following tab
- Message button on Connections tab
- View Profile button on all tabs
- Live count cards at top

### 🔍 Discover
- Search users by name, username, or bio (MongoDB text index)
- Shows all users except self
- UserCard with follow/following/follow-back status
- Message button appears when mutually connected
- Follower count display
- Location badge

### 🌐 Online Presence
- Real-time online/offline status tracking via Socket.IO
- Online users tracked server-side in memory Map
- Status broadcast on connect/disconnect

### 📱 Responsive Design
- Mobile-first responsive layout
- Collapsible sidebar with hamburger menu on mobile
- Touch-friendly story navigation
- Optimized for all screen sizes

---

## 🛠️ Tech Stack

### Frontend
| Technology       | Purpose                 |
| ---------------- | ----------------------- |
| React 19         | UI Framework            |
| Vite             | Build tool & dev server |
| Tailwind CSS v4  | Styling                 |
| React Router v7  | Client-side routing     |
| Socket.IO Client | Real-time communication |
| Lucide React     | Icons                   |
| React Hot Toast  | Notifications/toasts    |
| Moment.js        | Date formatting         |

### Backend
| Technology         | Purpose                   |
| ------------------ | ------------------------- |
| Node.js + Express  | REST API server           |
| MongoDB + Mongoose | Database & ODM            |
| Socket.IO          | Real-time WebSockets      |
| Cloudinary         | Image/video storage & CDN |
| bcryptjs           | Password hashing          |
| jsonwebtoken       | JWT authentication        |
| Multer             | File upload handling      |
| Morgan             | HTTP request logging      |

---

## 🗄️ Database Models

| Model            | Key Fields                                                                                    |
| ---------------- | --------------------------------------------------------------------------------------------- |
| **User**         | email, password, full_name, username, bio, profile_picture, cover_photo, followers, following |
| **Post**         | user, content, image_urls, likes_count, comments_count, hashtags, is_private, is_deleted      |
| **Comment**      | post, user, text, likes, reply_to, reply_to_user                                              |
| **Story**        | user, content, media_url, media_type, background_color, views, likes, expires_at              |
| **Message**      | from_user, to_user, text, media_url, message_type, seen                                       |
| **Notification** | recipient, sender, type, post, story, comment, is_read                                        |

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier works)
- Cloudinary account (free tier works)

### 1. Clone & Install

```bash
# Backend
cd server
npm install

# Frontend
cd client
npm install
```

### 2. Run

```bash
# Terminal 1 — Backend
cd server && node server.js

# Terminal 2 — Frontend
cd client && npm run dev
```

---


## 👨‍💻 Developer

**Muhammad Ahmad**  
Full Stack Developer | AI Engineer  
📍 Lahore, Pakistan

> *Built this entire platform solo — frontend, backend, real-time infrastructure, media storage, and authentication — all from scratch.*

---

## 📄 License

MIT License — feel free to use this project for learning or inspiration.
