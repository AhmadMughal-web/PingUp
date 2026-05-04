import React, { createContext, useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { api } from '../lib/api'

const AppContext = createContext(null)

export const AppProvider = ({ children }) => {
  const [dbUser, setDbUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('pingup_token'))
  const [socket, setSocket] = useState(null)
  const [onlineUsers, setOnlineUsers] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch user on mount if token exists
  useEffect(() => {
    if (!token) { setLoading(false); return }
    api.getMyProfile()
      .then((res) => setDbUser(res.user))
      .catch(() => { localStorage.removeItem('pingup_token'); setToken(null) })
      .finally(() => setLoading(false))
  }, [token])

  // Socket.IO
  useEffect(() => {
    if (!dbUser) return
    const newSocket = io(
      import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000',
      { query: { userId: dbUser._id } }
    )
    newSocket.on('user:online', ({ userId }) =>
      setOnlineUsers((prev) => [...new Set([...prev, userId])])
    )
    newSocket.on('user:offline', ({ userId }) =>
      setOnlineUsers((prev) => prev.filter((id) => id !== userId))
    )
    setSocket(newSocket)
    return () => newSocket.disconnect()
  }, [dbUser])

  const login = (userData, jwtToken) => {
    localStorage.clear()  // sab kuch clear karo
    localStorage.setItem('pingup_token', jwtToken)
    setToken(jwtToken)
    setDbUser(userData)
  }

  const logout = () => {
    localStorage.clear()  // sirf removeItem ki jagah clear
    setToken(null)
    setDbUser(null)
    socket?.disconnect()
    setSocket(null)
  }

  const refreshUser = async () => {
    try {
      const res = await api.getMyProfile()
      setDbUser(res.user)
    } catch { }
  }

  const isOnline = (userId) => onlineUsers.includes(userId)

  return (
    <AppContext.Provider value={{ dbUser, token, loading, socket, onlineUsers, isOnline, login, logout, refreshUser }}>
      {children}
    </AppContext.Provider>
  )
}

export const useAppContext = () => {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useAppContext must be inside AppProvider')
  return ctx
}
