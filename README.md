# PingUp 🚀

A full-stack social media platform built with React, Node.js, MongoDB, Cloudinary, Socket.IO, and Clerk authentication.

## Features
- 🔐 Authentication via Clerk (Sign up / Sign in)
- 👤 User profiles with profile picture, cover photo, bio, location
- 📝 Create posts with up to 5 images
- ❤️ Like / unlike posts
- 📖 Stories (text, image, video) — auto-expire after 24 hours
- 💬 Real-time messaging via Socket.IO
- 👥 Follow / unfollow users, mutual connections
- 🔍 Discover & search people
- 📱 Fully responsive (mobile + desktop)

## Tech Stack

**Frontend:** React 19, Vite, Tailwind CSS v4, Clerk, React Router, Socket.IO Client

**Backend:** Node.js, Express, MongoDB + Mongoose, Cloudinary, Socket.IO, Clerk Webhooks (Svix)

## Quick Start

See **SETUP.md** for the complete setup guide.

```bash
# Backend
cd server && npm install && npm run dev

# Frontend (new terminal)
cd client && npm install && npm run dev
```

## Project Structure

```
PingUp/
├── client/                    # React frontend (Vite)
│   └── src/
│       ├── pages/             # Feed, Profile, Messages, ChatBox, etc.
│       ├── components/        # PostCard, Sidebar, StoriesBar, etc.
│       ├── context/           # AppContext (Socket.IO + DB user state)
│       └── lib/api.js         # All API calls in one place
│
└── server/                    # Express backend
    ├── models/                # User, Post, Story, Message (Mongoose)
    ├── controllers/           # Business logic
    ├── routes/                # REST API routes
    ├── middleware/auth.js     # Clerk JWT verification
    └── config/                # DB + Cloudinary setup
```
# PingUp
