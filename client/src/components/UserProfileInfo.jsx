import { Calendar, MapPin, PenBox, Verified } from 'lucide-react'
import moment from 'moment'
import React, { useState } from 'react'
import { useAppContext } from '../context/AppContext'
import { api } from '../lib/api'
import toast from 'react-hot-toast'

const UserProfileInfo = ({ user, posts, profileId, setShowEdit }) => {
    const { dbUser, followUser, unfollowUser } = useAppContext()

    // Is the viewer already following this profile?
    const [isFollowing, setIsFollowing] = useState(
        () => dbUser?.following?.includes(user._id) ?? false
    )
    const [followerCount, setFollowerCount] = useState(user.followers?.length ?? 0)
    const [busy, setBusy] = useState(false)

    // Show edit button only on own profile (no :profileId param)
    const isOwnProfile = !profileId

    const profilePic =
        typeof user.profile_picture === 'string'
            ? user.profile_picture
            : user.profile_picture?.url || ''

    const handleFollow = async () => {
        if (busy) return
        setBusy(true)
        const wasFollowing = isFollowing
        setIsFollowing(!wasFollowing)
        setFollowerCount((c) => (wasFollowing ? c - 1 : c + 1))
        try {
            await api.toggleFollow(user._id)
            if (wasFollowing) {
                unfollowUser(user._id)
            } else {
                followUser(user._id)
            }
        } catch {
            setIsFollowing(wasFollowing)
            setFollowerCount((c) => (wasFollowing ? c + 1 : c - 1))
            toast.error('Action failed')
        } finally {
            setBusy(false)
        }
    }

    return (
        <div className='relative px-6 py-4 md:px-8 bg-white'>
            <div className='flex flex-col md:flex-row items-start gap-6'>

                {/* Avatar — overlaps the cover photo */}
                <div className='w-32 h-32 border-4 border-white shadow-lg absolute -top-16 rounded-full overflow-hidden bg-gray-200'>
                    <img
                        src={profilePic}
                        alt=''
                        className='w-full h-full object-cover rounded-full'
                    />
                </div>

                <div className='w-full pt-16 md:pt-0 md:pl-36'>
                    <div className='flex flex-col md:flex-row items-start justify-between'>
                        <div>
                            <div className='flex items-center gap-2'>
                                <h1 className='text-2xl font-bold text-gray-900'>{user.full_name}</h1>
                                {user.is_verified && (
                                    <Verified className='w-5 h-5 text-blue-500 flex-shrink-0' />
                                )}
                            </div>
                            <p className='text-gray-500 text-sm'>
                                {user.username ? `@${user.username}` : 'No username set'}
                            </p>
                        </div>

                        {/* Edit button on own profile, Follow button on others' */}
                        {isOwnProfile ? (
                            <button
                                onClick={() => setShowEdit(true)}
                                className='flex items-center gap-2 border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-lg font-medium transition-colors mt-4 md:mt-0 cursor-pointer text-sm'
                            >
                                <PenBox className='w-4 h-4' />
                                Edit Profile
                            </button>
                        ) : (
                            <button
                                onClick={handleFollow}
                                disabled={busy}
                                className={`px-5 py-2 rounded-lg text-sm font-medium transition active:scale-95 mt-4 md:mt-0 cursor-pointer disabled:opacity-60 ${isFollowing
                                        ? 'border border-gray-300 hover:bg-gray-50 text-gray-700'
                                        : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white'
                                    }`}
                            >
                                {isFollowing ? 'Following' : 'Follow'}
                            </button>
                        )}
                    </div>

                    {/* Bio */}
                    {user.bio && (
                        <p className='text-gray-700 text-sm max-w-md mt-3 whitespace-pre-line'>
                            {user.bio}
                        </p>
                    )}

                    {/* Location + joined date */}
                    <div className='flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-gray-500 mt-3'>
                        {user.location && (
                            <span className='flex items-center gap-1.5'>
                                <MapPin className='w-4 h-4' />
                                {user.location}
                            </span>
                        )}
                        <span className='flex items-center gap-1.5'>
                            <Calendar className='w-4 h-4' />
                            Joined {moment(user.createdAt).format('MMM YYYY')}
                        </span>
                    </div>

                    {/* Stats row */}
                    <div className='flex items-center gap-6 mt-5 border-t border-gray-100 pt-4'>
                        <div>
                            <span className='sm:text-xl font-bold text-gray-900'>{posts.length}</span>
                            <span className='text-xs sm:text-sm text-gray-500 ml-1'>Posts</span>
                        </div>
                        <div>
                            <span className='sm:text-xl font-bold text-gray-900'>{followerCount}</span>
                            <span className='text-xs sm:text-sm text-gray-500 ml-1'>Followers</span>
                        </div>
                        <div>
                            <span className='sm:text-xl font-bold text-gray-900'>
                                {user.following?.length ?? 0}
                            </span>
                            <span className='text-xs sm:text-sm text-gray-500 ml-1'>Following</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default UserProfileInfo
