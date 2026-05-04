import { BadgeCheck, Heart, MessageCircle, Share2, MoreVertical, Trash2, Globe, Lock, Send, X, Reply, ThumbsUp } from 'lucide-react'
import moment from 'moment'
import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router'
import { useAppContext } from '../context/AppContext'
import { api } from '../lib/api'
import toast from 'react-hot-toast'

const PostCard = ({ post, onLikeUpdate, onDelete, autoOpenComments = false }) => {
    const { dbUser } = useAppContext()
    const navigate = useNavigate()

    const [likes, setLikes] = useState(post.likes_count || [])
    const [liking, setLiking] = useState(false)

    // Comments state
    const [showComments, setShowComments] = useState(autoOpenComments)
    const [comments, setComments] = useState([])
    const [commentsLoaded, setCommentsLoaded] = useState(false)
    const [commentText, setCommentText] = useState('')
    const [commentCount, setCommentCount] = useState(post.comments_count || 0)
    const [sending, setSending] = useState(false)
    const [replyTo, setReplyTo] = useState(null) // { _id, username }

    // 3-dot menu state
    const [showMenu, setShowMenu] = useState(false)
    const [isPrivate, setIsPrivate] = useState(post.is_private || false)
    const menuRef = useRef(null)

    const isOwnPost = dbUser?._id === post.user?._id?.toString() ||
        dbUser?._id?.toString() === post.user?._id?.toString()

    // Close menu when clicking outside
    useEffect(() => {
        const handler = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setShowMenu(false)
            }
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    // autoOpenComments pe scroll karo — useEffect add karo
    // Existing useEffects ke baad add karo:
    useEffect(() => {
        if (autoOpenComments) {
            setTimeout(() => {
                document.getElementById(`post-${post._id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }, 500)
        }
    }, [autoOpenComments])

    // Load comments when section opens
    useEffect(() => {
        if (!showComments) return
        api.getComments(post._id)
            .then((res) => {
                const all = res.comments || []
                // Parent comments pehle, phir replies unke neeche
                const parents = all.filter(c => !c.reply_to)
                const replies = all.filter(c => !!c.reply_to)
                const ordered = []

                const addReplies = (parentId, depth = 1) => {
                    replies
                        .filter(r => r.reply_to?._id?.toString() === parentId || r.reply_to?.toString() === parentId)
                        .forEach(r => {
                            ordered.push({ ...r, isReply: true, depth })
                            addReplies(r._id?.toString(), depth + 1)
                        })
                }

                parents.forEach(p => {
                    ordered.push(p)
                    addReplies(p._id?.toString())
                })

                setComments(ordered)
                setCommentsLoaded(true)

            })
            .catch(() => { })
    }, [showComments])

    const getImageUrl = (img) => (typeof img === 'string' ? img : img?.url || '')
    const profilePicUrl = post.user?.profile_picture?.url || post.user?.profile_picture || ''

    // ── Like ─────────────────────────────────────────────────────────────
    const handleLike = async () => {
        if (!dbUser || liking) return
        setLiking(true)
        const myId = dbUser._id.toString()
        const alreadyLiked = likes.map(String).includes(myId)
        const newLikes = alreadyLiked
            ? likes.filter((id) => id.toString() !== myId)
            : [...likes, myId]
        setLikes(newLikes)
        onLikeUpdate?.(post._id, newLikes)
        try {
            const res = await api.toggleLike(post._id)
            setLikes(res.likes_count)
            onLikeUpdate?.(post._id, res.likes_count)
        } catch {
            setLikes(likes)
            onLikeUpdate?.(post._id, likes)
            toast.error('Could not update like')
        } finally {
            setLiking(false)
        }
    }

    // ── Comment ──────────────────────────────────────────────────────────
    const handleSendComment = async () => {
        if (!commentText.trim() || sending) return
        setSending(true)
        try {
            const token = localStorage.getItem('pingup_token')
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/comments/${post._id}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: commentText.trim(),
                    reply_to: replyTo?._id || null,
                    reply_to_user: replyTo?.username || ''
                })
            })
            const data = await res.json()
            if (!data.success) throw new Error(data.message)
            setComments((prev) => [data.comment, ...prev])
            setCommentCount((c) => c + 1)
            setCommentText('')
            setReplyTo(null)
        } catch (err) {
            toast.error(err.message || 'Could not send comment')
        } finally {
            setSending(false)
        }
    }

    const handleLikeComment = async (commentId) => {
        const token = localStorage.getItem('pingup_token')
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/comments/like/${commentId}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        })
        const data = await res.json()
        if (data.success) {
            setComments((prev) => prev.map((c) =>
                c._id === commentId ? { ...c, likes: data.likes } : c
            ))
        }
    }

    const handleDeleteComment = async (commentId) => {
        try {
            const token = localStorage.getItem('pingup_token')
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/comments/${commentId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await res.json()
            if (!data.success) throw new Error(data.message)
            setComments((prev) => prev.filter((c) => c._id !== commentId))
            setCommentCount((c) => c - 1)
            toast.success('Comment deleted')
        } catch {
            toast.error('Could not delete comment')
        }
    }

    // ── Share ─────────────────────────────────────────────────────────────
    const handleShare = () => {
        const url = `${window.location.origin}/post/${post._id}`
        if (navigator.share) {
            navigator.share({ title: `${post.user?.full_name}'s post`, url })
        } else {
            navigator.clipboard.writeText(url)
            toast.success('Link copied to clipboard!')
        }
    }

    // ── Delete ────────────────────────────────────────────────────────────
    const handleDelete = async () => {
        setShowMenu(false)
        toast.promise(
            api.deletePost(post._id).then(() => onDelete?.(post._id)),
            { loading: 'Deleting…', success: 'Post deleted', error: 'Could not delete post' }
        )
    }

    // ── Visibility toggle ─────────────────────────────────────────────────
    const handleToggleVisibility = async () => {
        setShowMenu(false)
        try {
            const res = await api.toggleVisibility(post._id)
            setIsPrivate(res.is_private)
            toast.success(res.is_private ? 'Post set to Private' : 'Post set to Public')
        } catch {
            toast.error('Could not update visibility')
        }
    }

    const isLiked = dbUser && likes.map(String).includes(dbUser._id?.toString())

    // ── Render ────────────────────────────────────────────────────────────
    const renderContent = (text) => {
        if (!text) return null
        return text.split(/(\s+)/).map((word, i) =>
            word.startsWith('#')
                ? <span key={i} className='text-indigo-600 font-medium'>{word}</span>
                : word
        )
    }

    return (
        <div id={`post-${post._id}`} className='bg-white rounded-xl shadow p-4 space-y-3 w-full max-w-2xl'>

            {/* ── Header ── */}
            <div className='flex items-center justify-between'>
                <div onClick={() => navigate('/profile/' + post.user?._id)}
                    className='inline-flex items-center gap-3 cursor-pointer'>
                    {profilePicUrl
                        ? <img src={profilePicUrl} alt='' className='w-10 h-10 rounded-full shadow object-cover' />
                        : <div className='w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold'>
                            {post.user?.full_name?.[0]?.toUpperCase()}
                        </div>
                    }
                    <div>
                        <div className='flex items-center gap-1'>
                            <span className='font-medium text-sm'>{post.user?.full_name}</span>
                            {post.user?.is_verified && <BadgeCheck className='w-4 h-4 text-blue-500' />}
                            {isPrivate && <Lock className='w-3 h-3 text-gray-400 ml-1' />}
                        </div>
                        <div className='text-gray-400 text-xs'>
                            @{post.user?.username} • {moment(post.createdAt).fromNow()}
                        </div>
                    </div>
                </div>

                {/* 3-dot menu — only on own posts */}
                {isOwnPost && (
                    <div className='relative' ref={menuRef}>
                        <button onClick={() => setShowMenu(!showMenu)}
                            className='p-1.5 rounded-full hover:bg-gray-100 transition cursor-pointer'>
                            <MoreVertical className='w-5 h-5 text-gray-500' />
                        </button>

                        {showMenu && (
                            <div className='absolute right-0 top-8 bg-white rounded-xl shadow-xl border border-gray-100 z-50 w-48 overflow-hidden'>
                                {/* Public / Private toggle */}
                                <button onClick={handleToggleVisibility}
                                    className='w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-sm transition cursor-pointer'>
                                    {isPrivate
                                        ? <><Globe className='w-4 h-4 text-indigo-500' /> Make Public</>
                                        : <><Lock className='w-4 h-4 text-gray-500' /> Make Private</>
                                    }
                                </button>
                                <div className='border-t border-gray-100' />
                                {/* Delete */}
                                <button onClick={handleDelete}
                                    className='w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-red-500 text-sm transition cursor-pointer'>
                                    <Trash2 className='w-4 h-4' /> Delete Post
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ── Content ── */}
            {post.content && (
                <p className='text-gray-800 text-sm whitespace-pre-line leading-relaxed'>
                    {renderContent(post.content)}
                </p>
            )}

            {/* ── Images ── */}
            {post.image_urls?.length > 0 && (
                <div className='grid grid-cols-2 gap-2'>
                    {post.image_urls.map((img, index) => (
                        <img src={getImageUrl(img)} key={index} alt=''
                            className={`w-full  object-contain rounded-lg ${post.image_urls.length === 1 ? 'col-span-2 h-auto max-h-96' : ''}`} />
                    ))}
                </div>
            )}

            {/* ── Action Bar ── */}
            <div className='flex items-center gap-5 text-gray-500 text-sm pt-2 border-t border-gray-100'>
                {/* Like */}
                <button onClick={handleLike} disabled={liking}
                    className='flex items-center gap-1.5 hover:text-red-400 transition-colors cursor-pointer'>
                    <Heart className={`w-4 h-4 transition-colors ${isLiked ? 'text-red-500 fill-red-500' : ''}`} />
                    <span>{likes.length}</span>
                </button>

                {/* Comment */}
                <button onClick={() => setShowComments(!showComments)}
                    className={`flex items-center gap-1.5 hover:text-indigo-500 transition-colors cursor-pointer ${showComments ? 'text-indigo-500' : ''}`}>
                    <MessageCircle className='w-4 h-4' />
                    <span>{commentCount}</span>
                </button>

                {/* Share */}
                <button onClick={handleShare}
                    className='flex items-center gap-1.5 hover:text-green-500 transition-colors cursor-pointer ml-auto'>
                    <Share2 className='w-4 h-4' />
                    <span className='text-xs'>Share</span>
                </button>
            </div>

            {/* ── Comments Section ── */}
            {showComments && (
                <div className='border-t border-gray-100 pt-3 space-y-3'>



                    {/* Comments List */}
                    {!commentsLoaded ? (
                        <p className='text-xs text-gray-400 text-center py-2'>Loading comments…</p>
                    ) : comments.length === 0 ? (
                        <p className='text-xs text-gray-400 text-center py-2'>No comments yet — be the first!</p>
                    ) : (
                        <div className='space-y-3 max-h-64 overflow-y-auto no-scrollbar'>
                            {comments.map((comment) => {
                                const commentPic = comment.user?.profile_picture?.url || comment.user?.profile_picture || ''
                                const isMyComment = dbUser?._id?.toString() === comment.user?._id?.toString()
                                return (
                                    <div key={comment._id}
                                        className={`flex items-start gap-2 ${comment.isReply ? `ml-${Math.min((comment.depth || 1) * 6, 16)} mt-1` : ''}`}>
                                        {commentPic
                                            ? <img src={commentPic} alt='' className='w-7 h-7 rounded-full object-cover flex-shrink-0 mt-0.5' />
                                            : <div className='w-7 h-7 rounded-full bg-indigo-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5'>
                                                {comment.user?.full_name?.[0]?.toUpperCase()}
                                            </div>
                                        }
                                        <div className='flex-1 min-w-0'>
                                            <div className='bg-gray-50 rounded-2xl rounded-tl-none px-3 py-2'>
                                                <span className='text-xs font-semibold text-gray-800'>{comment.user?.full_name}</span>
                                                {comment.reply_to_user && (
                                                    <span className='text-xs text-indigo-400 ml-1'>@{comment.reply_to_user}</span>
                                                )}
                                                <p className='text-sm text-gray-700 mt-0.5 break-words'>{comment.text || comment.content}</p>
                                            </div>
                                            <div className='flex items-center gap-3 ml-2 mt-1'>
                                                <span className='text-[10px] text-gray-400'>{moment(comment.createdAt).fromNow()}</span>
                                                <button
                                                    onClick={() => handleLikeComment(comment._id)}
                                                    className={`flex items-center gap-1 text-[10px] transition cursor-pointer ${(comment.likes || []).map(String).includes(dbUser?._id?.toString())
                                                        ? 'text-indigo-500' : 'text-gray-400 hover:text-indigo-400'
                                                        }`}>
                                                    <ThumbsUp className={`w-3 h-3 ${(comment.likes || []).map(id => id?._id?.toString() || id?.toString()).includes(dbUser?._id?.toString()) ? 'fill-indigo-500 text-indigo-500' : ''}`} />
                                                    {comment.likes?.length > 0 && <span>{comment.likes.length}</span>}
                                                </button>
                                                <button
                                                    onClick={() => { setReplyTo({ _id: comment._id, username: comment.user?.username }); setShowComments(true) }}
                                                    className='flex items-center gap-1 text-[10px] text-gray-400 hover:text-indigo-400 transition cursor-pointer'>
                                                    <Reply className='w-3 h-3' /> Reply
                                                </button>
                                                {isMyComment && (
                                                    <button onClick={() => handleDeleteComment(comment._id)}
                                                        className='text-[10px] text-gray-300 hover:text-red-400 transition cursor-pointer'>
                                                        <Trash2 className='w-3 h-3' />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                    {/* Input */}
                    <div className='flex items-center gap-2'>
                        {dbUser?.profile_picture?.url
                            ? <img src={dbUser.profile_picture.url} alt='' className='w-8 h-8 rounded-full object-cover flex-shrink-0' />
                            : <div className='w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0'>
                                {dbUser?.full_name?.[0]?.toUpperCase()}
                            </div>
                        }
                        <div className='flex-1 flex flex-col gap-1'>
                            {replyTo && (
                                <div className='flex items-center gap-1 text-xs text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full w-fit'>
                                    <Reply className='w-3 h-3' />
                                    Replying to @{replyTo.username}
                                    <button onClick={() => setReplyTo(null)} className='ml-1 hover:text-red-400 cursor-pointer'>
                                        <X className='w-3 h-3' />
                                    </button>
                                </div>
                            )}
                            <div className='flex items-center gap-2 bg-gray-50 rounded-full px-4 py-2 border border-gray-200'>
                                <input
                                    type='text'
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && !sending && handleSendComment()}
                                    placeholder={replyTo ? `Reply to @${replyTo.username}…` : 'Write a comment…'}
                                    className='flex-1 bg-transparent text-sm outline-none'
                                />
                                <button onClick={handleSendComment} disabled={!commentText.trim() || sending}
                                    className='text-indigo-500 hover:text-indigo-700 disabled:opacity-30 transition cursor-pointer'>
                                    <Send className='w-4 h-4' />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default PostCard
