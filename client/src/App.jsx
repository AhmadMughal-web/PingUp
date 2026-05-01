import React from 'react'
import { Route, Routes, Navigate } from 'react-router'
import { Toaster } from 'react-hot-toast'
import { useAppContext } from './context/AppContext'
import Loading from './components/Loading'

import Login from './pages/Login'
import Signup from './pages/Signup'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Layout from './pages/Layout'
import Feed from './pages/Feed'
import Messages from './pages/Messages'
import ChatBox from './pages/ChatBox'
import Connections from './pages/Connections'
import Discover from './pages/Discover'
import Profile from './pages/Profile'
import CreatePost from './pages/CreatePost'

// Protect routes — redirect to /login if not authenticated
const PrivateRoute = ({ children }) => {
  const { dbUser, loading } = useAppContext()
  if (loading) return <Loading />
  return dbUser ? children : <Navigate to='/login' replace />
}

// Public routes — redirect to / if already logged in
const PublicRoute = ({ children }) => {
  const { dbUser, loading } = useAppContext()
  if (loading) return <Loading />
  return !dbUser ? children : <Navigate to='/' replace />
}

const App = () => {
  return (
    <>
      <Toaster position='top-center' />
      <Routes>
        {/* Public */}
        <Route path='/login' element={<PublicRoute><Login /></PublicRoute>} />
        <Route path='/signup' element={<PublicRoute><Signup /></PublicRoute>} />
        <Route path='/forgot-password' element={<PublicRoute><ForgotPassword /></PublicRoute>} />
        <Route path='/reset-password' element={<PublicRoute><ResetPassword /></PublicRoute>} />

        {/* Protected */}
        <Route path='/' element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<Feed />} />
          <Route path='messages' element={<Messages />} />
          <Route path='messages/:userid' element={<ChatBox />} />
          <Route path='connections' element={<Connections />} />
          <Route path='discover' element={<Discover />} />
          <Route path='profile' element={<Profile />} />
          <Route path='profile/:profileId' element={<Profile />} />
          <Route path='create-post' element={<CreatePost />} />
        </Route>

        {/* Fallback */}
        <Route path='*' element={<Navigate to='/' replace />} />
      </Routes>
    </>
  )
}

export default App
