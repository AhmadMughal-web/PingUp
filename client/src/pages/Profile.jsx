import React, { useEffect, useState } from 'react'
import { Link, useParams, useLocation } from 'react-router'
import Loading from '../components/Loading'
import UserProfileInfo from '../components/UserProfileInfo'
import PostCard from '../components/PostCard'
import moment from 'moment'
import ProfileModel from '../components/ProfileModel'
import { api } from '../lib/api'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'

const Profile = () => {
  const { profileId } = useParams()
  const { dbUser } = useAppContext()
  const location = useLocation()
  const { highlightPost, openComments } = location.state || {}

  const [user, setUser] = useState(null)
  const [posts, setPosts] = useState([])
  const [activeTab, setActiveTab] = useState('posts')
  const [showEdit, setShowEdit] = useState(false)
  const [loading, setLoading] = useState(true)

  // Determine whose profile to show: own or someone else's
  const targetId = profileId || dbUser?._id

  const fetchUser = async () => {
    if (!targetId) return
    try {
      setLoading(true)
      const [userRes, postsRes] = await Promise.all([
        profileId ? api.getUserById(profileId) : api.getMyProfile(),
        api.getUserPosts(targetId),
      ])
      setUser(userRes.user)
      setPosts(postsRes.posts)
    } catch (err) {
      // silent fail
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUser()
  }, [profileId, dbUser])

  // After profile edit, refresh user data
  const handleProfileUpdated = async () => {
    await fetchUser()
    setShowEdit(false)
  }

  if (loading) return <Loading />

  return user ? (
    <div className='relative h-full overflow-y-scroll bg-gray-50 p-6'>
      <div className='max-w-3xl mx-auto'>

        {/* Profile Card */}
        <div className='bg-white rounded-2xl shadow overflow-hidden'>
          {/* Cover Photo */}
          <div className='h-40 md:h-46 bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200'>
            {user.cover_photo?.url && (
              <img src={user.cover_photo.url} className='h-full w-full object-cover' alt='Cover' />
            )}
          </div>
          {/* User Info */}
          <UserProfileInfo
            posts={posts}
            user={user}
            profileId={profileId}
            setShowEdit={setShowEdit}
          />
        </div>

        {/* Tabs */}
        <div className='mt-6'>
          <div className='bg-white rounded-xl shadow p-1 flex max-w-md mx-auto'>
            {['posts', 'media', 'likes'].map((tab) => (
              <button
                onClick={() => setActiveTab(tab)}
                key={tab}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${activeTab === tab ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Posts Tab */}
          {activeTab === 'posts' && (
            <div className='mt-6 flex flex-col items-center gap-6'>
              {posts.length === 0 && (
                <p className='text-gray-400 py-10'>No posts yet</p>
              )}
              {posts.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  autoOpenComments={openComments && post._id === highlightPost}
                />
              ))}
            </div>
          )}

          {/* Media Tab */}
          {activeTab === 'media' && (
            <div className='flex flex-wrap mt-6'>
              {posts
                .filter((post) => post.image_urls?.length > 0)
                .map((post) =>
                  post.image_urls.map((image, index) => (
                    <Link
                      target='_blank'
                      to={typeof image === 'string' ? image : image.url}
                      key={`${post._id}-${index}`}
                      className='relative group'
                    >
                      <img
                        src={typeof image === 'string' ? image : image.url}
                        alt=''
                        className='w-64 aspect-video object-cover'
                      />
                      <p className='absolute top-0 right-0 text-xs p-1 px-3 backdrop-blur-xl text-white opacity-0 group-hover:opacity-100 transition duration-300'>
                        {moment(post.createdAt).fromNow()}
                      </p>
                    </Link>
                  ))
                )}
            </div>
          )}

          {/* Likes Tab — placeholder, requires separate API */}
          {activeTab === 'likes' && (
            <div className='mt-6 flex flex-col items-center gap-6'>
              <p className='text-gray-400 py-10'>Liked posts coming soon</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEdit && (
        <ProfileModel setShowEdit={setShowEdit} onSaved={handleProfileUpdated} />
      )}
    </div>
  ) : (
    <Loading />
  )
}

export default Profile
