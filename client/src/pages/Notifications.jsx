import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import moment from 'moment'
import { Bell, Heart, MessageCircle, UserPlus, Mail, Reply, CheckCheck } from 'lucide-react'
import { api } from '../lib/api'
import Loading from '../components/Loading'

const typeConfig = {
    like_post: { icon: Heart, color: 'text-red-500', bg: 'bg-red-50', text: 'liked your post' },
    like_story: { icon: Heart, color: 'text-red-500', bg: 'bg-red-50', text: 'liked your story' },
    comment: { icon: MessageCircle, color: 'text-indigo-500', bg: 'bg-indigo-50', text: 'commented on your post' },
    reply: { icon: Reply, color: 'text-purple-500', bg: 'bg-purple-50', text: 'replied to your comment' },
    follow: { icon: UserPlus, color: 'text-green-500', bg: 'bg-green-50', text: 'started following you' },
    message: { icon: Mail, color: 'text-blue-500', bg: 'bg-blue-50', text: 'sent you a message' },
    story_reply: { icon: Reply, color: 'text-purple-500', bg: 'bg-purple-50', text: 'replied to your story' },
}

const Notifications = () => {
    const navigate = useNavigate()
    const [notifications, setNotifications] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        api.getNotifications()
            .then((data) => setNotifications(data.notifications || []))
            .catch(() => { })
            .finally(() => setLoading(false))
    }, [])

    const handleMarkAllRead = async () => {
        await api.markAllNotificationsRead()
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
    }

    const handleClick = (notification) => {
        // UI mein turant dot remove karo
        setNotifications((prev) =>
            prev.map((n) => (n._id === notification._id ? { ...n, is_read: true } : n))
        )

        // Backend pe mark as read — har click pe
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/notifications/${notification._id}/read`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('pingup_token')}` }
        }).catch(() => { })

        // Navigate
        switch (notification.type) {
            case 'message':
            case 'story_reply':
                navigate(`/messages/${notification.sender._id}`)
                break
            case 'follow':
            case 'like_story':
                navigate(`/profile/${notification.sender._id}`)
                break
            case 'like_post':
                navigate('/profile', { state: { highlightPost: notification.post?._id } })
                break
            case 'comment':
            case 'reply':
                navigate('/profile', { state: { highlightPost: notification.post?._id, openComments: true } })
                break
            default:
                navigate('/')
        }
    }

    const getProfilePic = (user) =>
        typeof user?.profile_picture === 'string' ? user.profile_picture : user?.profile_picture?.url || ''

    const unreadCount = notifications.filter((n) => !n.is_read).length

    if (loading) return <Loading />

    return (
        <div className='min-h-screen bg-slate-50'>
            <div className='max-w-2xl mx-auto p-6'>

                {/* Header */}
                <div className='flex items-center justify-between mb-6'>
                    <div>
                        <h1 className='text-3xl font-bold text-slate-900'>Notifications</h1>
                        {unreadCount > 0 && (
                            <p className='text-sm text-indigo-600 mt-1'>{unreadCount} unread</p>
                        )}
                    </div>
                    {unreadCount > 0 && (
                        <button
                            onClick={handleMarkAllRead}
                            className='flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 transition cursor-pointer border border-gray-200 px-3 py-1.5 rounded-lg hover:border-indigo-300'>
                            <CheckCheck className='w-4 h-4' />
                            Mark all read
                        </button>
                    )}
                </div>

                {/* Notifications List */}
                <div className='space-y-2'>
                    {notifications.length === 0 && (
                        <div className='text-center py-20'>
                            <Bell className='w-12 h-12 text-gray-300 mx-auto mb-3' />
                            <p className='text-gray-400'>No notifications yet</p>
                        </div>
                    )}

                    {notifications.map((notification) => {
                        const config = typeConfig[notification.type] || typeConfig.comment
                        const Icon = config.icon
                        const senderPic = getProfilePic(notification.sender)

                        return (
                            <div
                                key={notification._id}
                                onClick={() => handleClick(notification)}
                                className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all border ${notification.is_read
                                    ? 'bg-white border-gray-100 hover:bg-gray-50'
                                    : 'bg-indigo-50/50 border-indigo-100 hover:bg-indigo-50'
                                    }`}
                            >
                                {/* Avatar with icon badge */}
                                <div className='relative flex-shrink-0'>
                                    {senderPic
                                        ? <img src={senderPic} alt='' className='w-11 h-11 rounded-full object-cover' />
                                        : <div className='w-11 h-11 rounded-full bg-indigo-400 flex items-center justify-center text-white font-bold'>
                                            {notification.sender?.full_name?.[0]?.toUpperCase()}
                                        </div>
                                    }
                                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full ${config.bg} flex items-center justify-center border-2 border-white`}>
                                        <Icon className={`w-3 h-3 ${config.color}`} />
                                    </div>
                                </div>

                                {/* Content */}
                                <div className='flex-1 min-w-0'>
                                    <p className='text-sm text-gray-800'>
                                        <span className='font-semibold'>{notification.sender?.full_name}</span>
                                        {' '}{config.text}
                                    </p>
                                    {notification.post?.content && (
                                        <p className='text-xs text-gray-400 truncate mt-0.5'>
                                            "{notification.post.content.slice(0, 60)}"
                                        </p>
                                    )}
                                    <p className='text-xs text-gray-400 mt-1'>
                                        {moment(notification.createdAt).fromNow()}
                                    </p>
                                </div>

                                {/* Unread dot */}
                                {!notification.is_read && (
                                    <div className='w-2.5 h-2.5 bg-indigo-500 rounded-full flex-shrink-0' />
                                )}

                                {/* Post thumbnail */}
                                {notification.post?.image_urls?.[0] && (
                                    <img
                                        src={notification.post.image_urls[0]?.url || notification.post.image_urls[0]}
                                        alt=''
                                        className='w-10 h-10 rounded-lg object-cover flex-shrink-0'
                                    />
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

export default Notifications
