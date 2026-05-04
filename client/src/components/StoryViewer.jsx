import { BadgeCheck, X, Heart, Eye, MoreVertical, Trash2, ChevronLeft, ChevronRight, Send } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'

const STORY_DURATION = 10000

const StoryViewer = ({ viewStory, setViewStory, allStories = [], currentIndex = 0 }) => {
    const { dbUser } = useAppContext()
    const [progress, setProgress] = useState(0)
    const [liked, setLiked] = useState(false)
    const [likesCount, setLikesCount] = useState(0)
    const [showViewers, setShowViewers] = useState(false)
    const [viewers, setViewers] = useState([])
    const [viewerLikes, setViewerLikes] = useState([])
    const [showMenu, setShowMenu] = useState(false)
    const [replyText, setReplyText] = useState('')
    const [sending, setSending] = useState(false)

    const isOwnStory = dbUser?._id?.toString() === (viewStory?.user?._id || viewStory?.user)?.toString()
    console.log('isOwnStory:', isOwnStory, 'dbUser:', dbUser?._id, 'storyUser:', viewStory?.user?._id, viewStory?.user)

    useEffect(() => {
        if (!viewStory) return
        setLiked((viewStory.likes || []).map(String).includes(dbUser?._id?.toString()))
        setLikesCount((viewStory.likes || []).length)
        setShowViewers(false)
        setViewers([])

        if (viewStory._id) {
            api.viewStory(viewStory._id).catch(() => { })
        }

        if (viewStory.media_type === 'video') return

        setProgress(0)
        let elapsed = 0
        const tick = setInterval(() => {
            elapsed += 100
            setProgress((elapsed / STORY_DURATION) * 100)
        }, 100)
        const autoClose = setTimeout(() => setViewStory(null), STORY_DURATION)

        return () => { clearInterval(tick); clearTimeout(autoClose) }
    }, [viewStory])

    const goNext = () => {
        if (currentIndex < allStories.length - 1) setViewStory(allStories[currentIndex + 1])
    }
    const goPrev = () => {
        if (currentIndex > 0) setViewStory(allStories[currentIndex - 1])
    }

    const handleLike = async () => {
        try {
            const token = localStorage.getItem('pingup_token')
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/stories/like/${viewStory._id}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await res.json()
            if (data.success) {
                setLiked(!liked)
                setLikesCount(data.likes.length)
            }
        } catch {
            toast.error('Could not like story')
        }
    }

    const handleShowViewers = async () => {
        if (!isOwnStory) return
        try {
            const token = localStorage.getItem('pingup_token')
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/stories/viewers/${viewStory._id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await res.json()
            if (data.success) {
                setViewers(data.views || [])
                setViewerLikes(data.likes || [])
                setShowViewers(true)
            }
        } catch {
            toast.error('Could not load viewers')
        }
    }
    const handleDelete = async () => {
        try {
            const token = localStorage.getItem('pingup_token')
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/stories/${viewStory._id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await res.json()
            if (data.success) { toast.success('Story deleted'); setViewStory(null) }
        } catch { toast.error('Could not delete') }
    }
    const handleReply = async () => {
        if (!replyText.trim() || sending) return
        setSending(true)
        try {
            const token = localStorage.getItem('pingup_token')
            const fd = new FormData()
            fd.append('to_user_id', viewStory.user._id)
            fd.append('text', `Replied to your story: "${replyText.trim()}"`)
            fd.append('is_story_reply', 'true')
            await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/messages/send`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: fd
            })
            setReplyText('')
            toast.success('Reply sent!')
        } catch {
            toast.error('Could not send reply')
        } finally {
            setSending(false)
        }
    }

    if (!viewStory) return null

    const profilePic = typeof viewStory.user?.profile_picture === 'string'
        ? viewStory.user.profile_picture
        : viewStory.user?.profile_picture?.url || ''

    const bgColor = viewStory.media_type === 'text' ? viewStory.background_color : '#000000'

    const renderContent = () => {
        switch (viewStory.media_type) {
            case 'image': return <img src={viewStory.media_url} alt='Story' className='max-w-full max-h-[85vh] object-contain rounded-lg' />
            case 'video': return <video src={viewStory.media_url} className='max-h-[85vh] rounded-lg' controls autoPlay onEnded={() => setViewStory(null)} />
            default: return (
                <div className='w-full min-h-64 flex items-center justify-center p-8 text-white text-2xl font-medium text-center'>
                    {viewStory.content}
                </div>
            )
        }
    }

    return (
        <div className='fixed inset-0 z-[110] flex items-center justify-center' style={{ backgroundColor: bgColor }}>

            {/* Progress bar */}
            {viewStory.media_type !== 'video' && (
                <div className='absolute top-0 left-0 w-full h-1 bg-white/20'>
                    <div className='h-full bg-white transition-none' style={{ width: `${progress}%` }} />
                </div>
            )}

            {/* Top left — user info */}
            <div className='absolute top-5 left-4 flex items-center gap-3 px-4 py-2 backdrop-blur-md rounded-lg bg-black/40'>
                <img src={profilePic} alt='' className='size-8 rounded-full object-cover border border-white/60' />
                <div className='text-white font-medium flex items-center gap-1.5 text-sm'>
                    <span>{viewStory.user?.full_name}</span>
                    {viewStory.user?.is_verified && <BadgeCheck size={16} className='text-blue-400' />}
                </div>
            </div>

            {/* Top right — close + 3dot */}
            <div className='absolute top-4 right-4 flex items-center gap-2'>
                {isOwnStory && (
                    <div className='relative'>
                        <button onClick={() => setShowMenu(!showMenu)} className='text-white cursor-pointer p-1'>
                            <MoreVertical className='w-6 h-6' />
                        </button>
                        {showMenu && (
                            <div className='absolute right-0 top-8 bg-white rounded-xl shadow-xl w-40 overflow-hidden z-50'>
                                <button onClick={handleDelete}
                                    className='w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-red-500 text-sm cursor-pointer'>
                                    <Trash2 className='w-4 h-4' /> Delete Story
                                </button>
                            </div>
                        )}
                    </div>
                )}
                <button onClick={() => setViewStory(null)} className='text-white cursor-pointer'>
                    <X className='w-7 h-7 hover:scale-110 transition' />
                </button>
            </div>

            {/* Story content */}
            <div className='max-w-[90vw] max-h-[90vh] flex items-center justify-center'>
                {renderContent()}
            </div>

            {/* Left Arrow */}
            {currentIndex > 0 && (
                <button onClick={goPrev}
                    className='absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full cursor-pointer transition z-20'>
                    <ChevronLeft className='w-6 h-6' />
                </button>
            )}

            {/* Right Arrow */}
            {currentIndex < allStories.length - 1 && (
                <button onClick={goNext}
                    className='absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full cursor-pointer transition z-20'>
                    <ChevronRight className='w-6 h-6' />
                </button>
            )}

            {/* Bottom bar — like + views */}
            <div className='absolute bottom-6 left-0 right-0 flex items-center gap-3 px-6'>

                {/* Like button */}
                {!isOwnStory && (
                    <button onClick={(e) => { e.stopPropagation(); handleLike() }}
                        className='flex items-center gap-2 text-white cursor-pointer'>
                        <Heart className={`w-7 h-7 transition-all ${liked ? 'fill-red-500 text-red-500 scale-110' : 'text-white'}`} />
                        {likesCount > 0 && <span className='text-white text-sm'>{likesCount}</span>}
                    </button>
                )}

                {/* Views — only for own story */}
                {!isOwnStory && (
                    <div className='flex-1 flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 border border-white/30'>
                        <input
                            type='text'
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleReply()}
                            placeholder='Reply to story…'
                            className='flex-1 bg-transparent text-white placeholder-white/70 text-sm outline-none'
                        />
                        <button onClick={handleReply} disabled={!replyText.trim() || sending}
                            className='text-white disabled:opacity-40 cursor-pointer'>
                            <Send className='w-4 h-4' />
                        </button>
                    </div>
                )}

                {isOwnStory && (
                    <button onClick={(e) => { e.stopPropagation(); handleShowViewers() }}
                        className='flex items-center gap-2 text-white cursor-pointer bg-black/30 px-4 py-2 rounded-full backdrop-blur-sm'>
                        <Eye className='w-5 h-5' />
                        <span className='text-sm'>{(viewStory.views || []).length} views</span>
                        <Heart className='w-5 h-5 ml-2 text-red-400' />
                        <span className='text-sm'>{likesCount}</span>
                    </button>
                )}
            </div>

            {/* Viewers Modal */}
            {showViewers && (
                <div className='absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-6 max-h-80 overflow-y-auto z-50'>
                    <div className='flex items-center justify-between mb-4'>
                        <h3 className='font-bold text-gray-800'>Viewers ({viewers.length})</h3>
                        <button onClick={() => setShowViewers(false)} className='cursor-pointer text-gray-400 hover:text-gray-600'>
                            <X className='w-5 h-5' />
                        </button>
                    </div>
                    {viewers.length === 0
                        ? <p className='text-gray-400 text-center py-4'>No views yet</p>
                        : viewers.map((v) => {
                            const hasLiked = viewerLikes.some(l => l._id?.toString() === v._id?.toString())
                            const pic = v.profile_picture?.url || v.profile_picture || ''
                            return (
                                <div key={v._id} className='flex items-center justify-between py-2'>
                                    <div className='flex items-center gap-3'>
                                        {pic
                                            ? <img src={pic} alt='' className='w-9 h-9 rounded-full object-cover' />
                                            : <div className='w-9 h-9 rounded-full bg-indigo-400 flex items-center justify-center text-white text-sm font-bold'>
                                                {v.full_name?.[0]?.toUpperCase()}
                                            </div>
                                        }
                                        <div>
                                            <p className='text-sm font-medium'>{v.full_name}</p>
                                            <p className='text-xs text-gray-400'>@{v.username}</p>
                                        </div>
                                    </div>
                                    {hasLiked && <Heart className='w-4 h-4 fill-red-500 text-red-500' />}
                                </div>
                            )
                        })
                    }
                </div>
            )}
        </div>
    )
}

export default StoryViewer
