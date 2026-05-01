import React, { useState } from 'react'
import { MapPin, MessageCircle, UserCheck, UserPlus } from 'lucide-react'
import { useNavigate } from 'react-router'
import { useAppContext } from '../context/AppContext'
import { api } from '../lib/api'
import toast from 'react-hot-toast'

const UserCard = ({ user }) => {
    const { dbUser } = useAppContext()
    const navigate = useNavigate()

    // Initialise from the data already in the user object so the card is
    // instantly correct without an extra fetch
    const theyFollowMe = dbUser?.followers?.map(String)?.includes(user._id?.toString()) ?? false
    const iFollowThem = dbUser?.following?.map(String)?.includes(user._id?.toString()) ?? false

    const [isFollowing, setIsFollowing] = useState(iFollowThem)
    const [followsMe, setFollowsMe] = useState(theyFollowMe)
    const [isConnected, setIsConnected] = useState(
        () => {
            const myFollowing = dbUser?.following?.map(String) || []
            const myFollowers = dbUser?.followers?.map(String) || []
            return myFollowing.includes(user._id?.toString()) && myFollowers.includes(user._id?.toString())
        }
    )
    const [followerCount, setFollowerCount] = useState(
        user.followers?.length ?? 0
    )
    const [busy, setBusy] = useState(false)

    const profilePic =
        typeof user.profile_picture === 'string'
            ? user.profile_picture
            : user.profile_picture?.url || ''

    const handleFollow = async () => {
        if (busy) return
        setBusy(true)
        // Optimistic update
        const wasFollowing = isFollowing
        setIsFollowing(!wasFollowing)
        setFollowerCount((c) => (wasFollowing ? c - 1 : c + 1))
        try {
            await api.toggleFollow(user._id)
        } catch {
            // Revert on failure
            setIsFollowing(wasFollowing)
            setFollowerCount((c) => (wasFollowing ? c + 1 : c - 1))
            toast.error('Action failed')
        } finally {
            setBusy(false)
        }
    }

    const handleMessageOrConnect = () => {
        if (isConnected) {
            navigate(`/messages/${user._id}`)
        } else {
            // Follow them — once they follow back it becomes a connection
            handleFollow()
        }
    }

    return (
        <div className='p-4 pt-6 flex flex-col justify-between w-72 shadow border border-gray-200 rounded-md bg-white'>
            {/* Avatar + name */}
            <div
                className='text-center cursor-pointer'
                onClick={() => navigate(`/profile/${user._id}`)}
            >
                <img
                    src={profilePic}
                    alt=''
                    className='rounded-full w-16 h-16 shadow-md mx-auto object-cover'
                />
                <p className='mt-4 font-semibold'>{user.full_name}</p>
                {user.username && (
                    <p className='text-gray-500 font-light text-sm'>@{user.username}</p>
                )}
                {user.bio && (
                    <p className='text-gray-600 mt-2 text-center text-sm px-4 line-clamp-2'>
                        {user.bio}
                    </p>
                )}
            </div>

            {/* Location + follower count */}
            <div className='flex items-center justify-center gap-2 mt-4 text-xs text-gray-600 flex-wrap'>
                {user.location && (
                    <div className='flex items-center gap-1 border border-gray-300 rounded-full px-3 py-1'>
                        <MapPin className='w-3 h-3' />
                        {user.location}
                    </div>
                )}
                <div className='flex items-center gap-1 border border-gray-300 rounded-full px-3 py-1'>
                    <span className='font-medium'>{followerCount}</span> Followers
                </div>
            </div>

            {/* Action buttons */}
            <div className='mt-4 gap-2 flex'>
                {/* Follow / Following */}
                <button
                    onClick={handleFollow}
                    disabled={busy}
                    className={`w-full py-2 rounded-md flex items-center justify-center gap-2 active:scale-95 transition text-sm cursor-pointer disabled:opacity-60 ${isFollowing
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white'
                        }`}
                >
                    {isFollowing ? (
                        <>
                            <UserCheck className='w-4 h-4' /> Following
                        </>
                    ) : followsMe ? (
                        <>
                            <UserPlus className='w-4 h-4' /> Follow Back
                        </>
                    ) : (
                        <>
                            <UserPlus className='w-4 h-4' /> Follow
                        </>
                    )}
                </button>

                {/* Message (if connected) or Connect */}
                <button
                    onClick={handleMessageOrConnect}
                    disabled={busy}
                    className='flex items-center justify-center w-12 border border-gray-300 text-slate-500 hover:bg-gray-50 group rounded-md cursor-pointer active:scale-95 transition disabled:opacity-60'
                    title={isConnected ? 'Message' : 'Connect'}
                >
                    {isConnected ? (
                        <MessageCircle className='w-5 h-5 group-hover:scale-105 transition' />
                    ) : (
                        <UserPlus className='w-5 h-5 group-hover:scale-105 transition' />
                    )}
                </button>
            </div>
        </div>
    )
}

export default UserCard
