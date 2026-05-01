import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { MessageSquare, UserCheck, UserPlus, UserRoundPen, Users } from 'lucide-react'
import { api } from '../lib/api'
import Loading from '../components/Loading'
import toast from 'react-hot-toast'

const Connections = () => {
  const navigate = useNavigate()
  const [currentTab, setCurrentTab] = useState('Followers')
  const [data, setData] = useState({ Followers: [], Following: [], Pending: [], Connection: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [followersRes, followingRes, pendingRes, connectionsRes] = await Promise.all([
          api.getMyFollowers(),
          api.getMyFollowing(),
          api.getPendingConnections(),
          api.getMyConnections(),
        ])
        setData({
          Followers: followersRes.followers || [],
          Following: followingRes.following || [],
          Pending: pendingRes.pending || [],
          Connection: connectionsRes.connections || [],
        })
      } catch {
        // silent fail — backend not running
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleUnfollow = async (clerkId) => {
    try {
      await api.toggleFollow(clerkId)
      setData((prev) => ({ ...prev, Following: prev.Following.filter((u) => u._id !== clerkId) }))
      toast.success('Unfollowed')
    } catch {
      toast.error('Could not unfollow')
    }
  }

  const handleFollowBack = async (clerkId) => {
    try {
      await api.toggleFollow(clerkId)
      // Move from pending to connections
      const user = data.Pending.find((u) => u._id === clerkId)
      setData((prev) => ({
        ...prev,
        Pending: prev.Pending.filter((u) => u._id !== clerkId),
        Connection: [...prev.Connection, user],
        Following: [...prev.Following, user],
      }))
      toast.success('Now connected!')
    } catch {
      toast.error('Could not follow back')
    }
  }

  const tabs = [
    { label: 'Followers', icon: Users },
    { label: 'Following', icon: UserCheck },
    { label: 'Pending', icon: UserRoundPen },
    { label: 'Connection', icon: UserPlus },
  ]

  const getProfilePic = (user) =>
    typeof user?.profile_picture === 'string' ? user.profile_picture : user?.profile_picture?.url || ''

  const currentList = data[currentTab] || []

  if (loading) return <Loading />

  return (
    <div className='min-h-screen bg-slate-50'>
      <div className='max-w-6xl mx-auto p-6'>

        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-slate-900 mb-2'>Connections</h1>
          <p className='text-slate-600'>Manage your network and discover new connections</p>
        </div>

        {/* Count cards */}
        <div className='mb-8 flex flex-wrap gap-6'>
          {tabs.map((tab) => (
            <div key={tab.label}
              onClick={() => setCurrentTab(tab.label)}
              className='flex flex-col items-center justify-center gap-1 border h-20 w-40 border-gray-200 bg-white shadow rounded-md cursor-pointer hover:border-indigo-300 transition'>
              <b className='text-lg'>{data[tab.label].length}</b>
              <p className='text-slate-600 text-sm'>{tab.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className='inline-flex flex-wrap items-center border border-gray-200 rounded-md p-1 bg-white shadow-sm mb-6'>
          {tabs.map((tab) => (
            <button onClick={() => setCurrentTab(tab.label)} key={tab.label}
              className={`cursor-pointer flex items-center gap-1 px-3 py-1.5 text-sm rounded-md transition-colors ${currentTab === tab.label ? 'bg-indigo-600 text-white font-medium' : 'text-gray-500 hover:text-black'}`}>
              <tab.icon className='w-4 h-4' />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* User cards */}
        <div className='flex flex-wrap gap-3'>
          {currentList.length === 0 && (
            <p className='text-gray-400 py-10'>No {currentTab.toLowerCase()} yet</p>
          )}
          {currentList.map((user) => (
            // FIX: key={user._id} not key={user}
            <div key={user._id} className='w-full max-w-80 flex gap-4 p-5 bg-white shadow rounded-md'>
              <img src={getProfilePic(user)} alt='' className='rounded-full w-12 h-12 shadow-md object-cover flex-shrink-0' />
              <div className='flex-1 min-w-0'>
                <p className='font-medium text-slate-700 truncate'>{user.full_name}</p>
                <p className='text-slate-500 text-sm'>@{user.username}</p>
                <p className='text-sm text-gray-600 truncate'>{user.bio?.slice(0, 40)}</p>
                <div className='flex flex-col sm:flex-row gap-2 mt-3'>
                  <button onClick={() => navigate(`/profile/${user._id}`)}
                    className='flex-1 p-2 text-sm rounded bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 active:scale-95 transition text-white cursor-pointer'>
                    View Profile
                  </button>

                  {currentTab === 'Following' && (
                    <button onClick={() => handleUnfollow(user._id)}
                      className='flex-1 p-2 text-sm rounded bg-slate-100 hover:bg-slate-200 text-black active:scale-95 transition cursor-pointer'>
                      Unfollow
                    </button>
                  )}
                  {currentTab === 'Pending' && (
                    <button onClick={() => handleFollowBack(user._id)}
                      className='flex-1 p-2 text-sm rounded bg-green-100 hover:bg-green-200 text-green-800 active:scale-95 transition cursor-pointer'>
                      Follow Back
                    </button>
                  )}
                  {currentTab === 'Connection' && (
                    <button onClick={() => navigate(`/messages/${user._id}`)}
                      className='flex-1 p-2 text-sm rounded bg-slate-100 hover:bg-slate-200 text-black active:scale-95 transition cursor-pointer flex items-center justify-center gap-1'>
                      <MessageSquare className='w-4 h-4' /> Message
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Connections
