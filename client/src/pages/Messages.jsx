import React, { useEffect, useState } from 'react'
import { Eye, MessageSquare } from 'lucide-react'
import { useNavigate } from 'react-router'
import { api } from '../lib/api'
import Loading from '../components/Loading'
import toast from 'react-hot-toast'

const Messages = () => {
  const navigate = useNavigate()
  const [inbox, setInbox] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getInbox()
      .then((data) => setInbox(data.inbox || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const getProfilePic = (user) =>
    typeof user?.profile_picture === 'string' ? user.profile_picture : user?.profile_picture?.url || ''

  if (loading) return <Loading />

  return (
    <div className='min-h-screen relative bg-slate-50'>
      <div className='max-w-6xl mx-auto p-6'>

        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-slate-900 mb-2'>Messages</h1>
          <p className='text-slate-600'>Talk to your friends and connections</p>
        </div>

        <div className='flex flex-col gap-3'>
          {inbox.length === 0 && (
            <p className='text-gray-400 py-10 text-center'>No conversations yet. Connect with people to start chatting!</p>
          )}
          {inbox.map((item) => (
            <div key={item.user?._id} className='max-w-xl flex gap-5 p-6 bg-white shadow rounded-md'>
              <img src={getProfilePic(item.user)} alt='' className='rounded-full size-12 object-cover flex-shrink-0' />
              <div className='flex-1 min-w-0'>
                <p className='font-medium text-slate-700'>{item.user?.full_name}</p>
                <p className='text-slate-500'>@{item.user?.username}</p>
                <p className='text-sm text-gray-500 truncate'>
                  {item.lastMessage?.text || 'Media'}
                </p>
              </div>
              <div className='flex flex-col gap-2 flex-shrink-0'>
                <button
                  onClick={() => navigate(`/messages/${item.user?._id}`)}
                  className='size-10 flex items-center justify-center text-sm rounded bg-slate-100 hover:bg-slate-200 text-slate-800 active:scale-95 transition cursor-pointer'>
                  <MessageSquare className='w-4 h-4' />
                </button>
                <button
                  onClick={() => navigate(`/profile/${item.user?._id}`)}
                  className='size-10 flex items-center justify-center text-sm rounded bg-slate-100 hover:bg-slate-200 text-slate-800 active:scale-95 transition cursor-pointer'>
                  <Eye className='w-4 h-4' />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Messages
