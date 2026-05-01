import { BadgeCheck, X, MoreVertical, Trash2 } from 'lucide-react'
import React, { useEffect, useState, useRef } from 'react'
import { api } from '../lib/api'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'

const STORY_DURATION = 10000 // 10 seconds

const StoryViewer = ({ viewStory, setViewStory }) => {
    const [progress, setProgress] = useState(0)
    const { dbUser } = useAppContext()
    const [showMenu, setShowMenu] = useState(false)
    const menuRef = useRef(null)
    const isOwnStory = dbUser?._id?.toString() === viewStory?.user?._id?.toString()

    const handleDelete = async () => {
        try {
            const token = localStorage.getItem('pingup_token')
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/stories/${viewStory._id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await res.json()
            if (!data.success) throw new Error(data.message)
            toast.success('Story deleted')
            setViewStory(null)
        } catch {
            toast.error('Could not delete story')
        }
    }

    // Mark viewed + start progress timer
    useEffect(() => {
        if (!viewStory) return

        // Record view on the backend (fire-and-forget)
        if (viewStory._id) {
            api.viewStory(viewStory._id).catch(() => { })
        }

        // Videos self-close via onEnded — no timer needed
        if (viewStory.media_type === 'video') return

        setProgress(0)
        const interval = 100
        let elapsed = 0

        const tick = setInterval(() => {
            elapsed += interval
            setProgress((elapsed / STORY_DURATION) * 100)
        }, interval)

        const autoClose = setTimeout(() => {
            setViewStory(null)
        }, STORY_DURATION)

        return () => {
            clearInterval(tick)
            clearTimeout(autoClose)
        }
    }, [viewStory, setViewStory])

    if (!viewStory) return null

    // Normalise profile picture — may be string or {url, public_id}
    const profilePic =
        typeof viewStory.user?.profile_picture === 'string'
            ? viewStory.user.profile_picture
            : viewStory.user?.profile_picture?.url || ''

    const bgColor =
        viewStory.media_type === 'text' ? viewStory.background_color : '#000000'

    const renderContent = () => {
        switch (viewStory.media_type) {
            case 'image':
                return (
                    <img
                        src={viewStory.media_url}
                        alt='Story'
                        className='max-w-full max-h-[85vh] object-contain rounded-lg'
                    />
                )
            case 'video':
                return (
                    <video
                        src={viewStory.media_url}
                        className='max-h-[85vh] rounded-lg'
                        controls
                        autoPlay
                        onEnded={() => setViewStory(null)}
                    />
                )
            case 'text':
            default:
                return (
                    <div className='w-full h-full min-h-64 flex items-center justify-center p-8 text-white text-2xl font-medium text-center'>
                        {viewStory.content}
                    </div>
                )
        }
    }

    return (
        <div
            className='fixed inset-0 z-[110] flex items-center justify-center'
            style={{ backgroundColor: bgColor }}
        >
            {/* Progress bar — hidden for videos */}
            {viewStory.media_type !== 'video' && (
                <div className='absolute top-0 left-0 w-full h-1 bg-white/20'>
                    <div
                        className='h-full bg-white transition-none'
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}

            {/* User info — top left */}
            <div className='absolute top-5 left-4 flex items-center gap-3 px-4 py-2 backdrop-blur-md rounded-lg bg-black/40'>
                <img
                    src={profilePic}
                    alt=''
                    className='size-8 rounded-full object-cover border border-white/60'
                />
                <div className='text-white font-medium flex items-center gap-1.5 text-sm'>
                    <span>{viewStory.user?.full_name}</span>
                    {viewStory.user?.is_verified && <BadgeCheck size={16} className='text-blue-400' />}
                </div>
            </div>
            
            {/* Close button */}
            {/* Top right buttons */}
            <div className='absolute top-4 right-4 flex items-center gap-2'>
                {isOwnStory && (
                    <div className='relative' ref={menuRef}>
                        <button onClick={() => setShowMenu(!showMenu)}
                            className='text-white p-1 cursor-pointer'>
                            <MoreVertical className='w-6 h-6' />
                        </button>
                        {showMenu && (
                            <div className='absolute right-0 top-8 bg-white rounded-xl shadow-xl border border-gray-100 w-40 overflow-hidden z-50'>
                                <button onClick={handleDelete}
                                    className='w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-red-500 text-sm cursor-pointer'>
                                    <Trash2 className='w-4 h-4' /> Delete Story
                                </button>
                            </div>
                        )}
                    </div>
                )}
                <button onClick={() => setViewStory(null)}
                    className='text-white cursor-pointer'>
                    <X className='w-7 h-7 hover:scale-110 transition' />
                </button>
            </div>

            {/* Story content */}
            <div className='max-w-[90vw] max-h-[90vh] flex items-center justify-center'>
                {renderContent()}
            </div>
        </div>
    )
}

export default StoryViewer
