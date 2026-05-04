import React, { useEffect, useState } from 'react'
import { Link } from 'react-router'
import moment from 'moment'
import { api } from '../lib/api'

const RecentMessages = () => {
    const [messages, setMessages] = useState([])

    useEffect(() => {
        api.getRecentMessages()
            .then((data) => setMessages(data.recentMessages || []))
            .catch(() => { })
    }, [])

    const getProfilePic = (user) =>
        typeof user?.profile_picture === 'string' ? user.profile_picture : user?.profile_picture?.url || ''

    return (
        <div className='bg-white max-w-xs pt-4 p-4 min-h-20 rounded-md shadow text-xs text-slate-800 mt-4'>
            <h3 className='font-semibold text-slate-800 mb-4'>Recent Messages</h3>
            <div className='flex flex-col max-h-56 overflow-y-scroll no-scrollbar'>
                {messages.length === 0 && (
                    <p className='text-gray-400 text-center py-2'>No messages yet</p>
                )}
                {messages.map((item, index) => (
                    <Link to={`/messages/${item.user?._id}`} key={index}
                        className='flex items-start gap-2 py-2 hover:bg-slate-100 rounded px-1'>
                        <img src={getProfilePic(item.user)} alt=''
                            className='w-8 h-8 rounded-full object-cover flex-shrink-0' />
                        <div className='w-full min-w-0'>
                            <div className='flex justify-between'>
                                <p className='font-medium truncate'>{item.user?.full_name}</p>
                                <p className='text-[10px] text-slate-400 ml-1 flex-shrink-0'>
                                    {moment(item.lastMessage?.createdAt).fromNow()}
                                </p>
                            </div>
                            <div className='flex justify-between items-center'>
                                <p className='text-gray-500 truncate'>
                                    {item.lastMessage?.text || 'Media'}
                                </p>
                                {item.unreadCount > 0 && (
                                    <span className='bg-indigo-500 text-white w-4 h-4 flex items-center justify-center rounded-full text-[10px] ml-1 flex-shrink-0'>
                                        {item.unreadCount > 9 ? '9+' : item.unreadCount}
                                    </span>
                                )}
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}

export default RecentMessages
