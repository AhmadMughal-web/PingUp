import React, { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import moment from 'moment'
import StoriesModel from './StoriesModel'
import StoryViewer from './StoryViewer'
import { api } from '../lib/api'

const StoriesBar = () => {
    const [stories, setStories] = useState([])
    const [showModel, setShowModel] = useState(false)
    const [viewStory, setViewStory] = useState(null)

    const fetchStories = async () => {
        try {
            const data = await api.getStories()
            setStories(data.stories || [])
        } catch {
            // Silent fail — backend not running yet, don't spam toasts
            setStories([])
        }
    }

    useEffect(() => { fetchStories() }, [])

    const getProfilePic = (user) =>
        typeof user?.profile_picture === 'string' ? user.profile_picture : user?.profile_picture?.url || ''

    return (
        <div className='w-screen sm:w-[calc(100vw-240px)] lg:max-w-2xl no-scrollbar overflow-x-auto px-4'>
            <div className='flex gap-4 pb-5'>

                {/* Add Story Card */}
                <div onClick={() => setShowModel(true)}
                    className='rounded-lg shadow-sm min-w-32 max-w-32 max-h-40 aspect-[3/4] cursor-pointer hover:shadow-lg transition-all duration-200 border-2 border-dashed border-indigo-300 bg-gradient-to-b from-indigo-50 to-white'>
                    <div className='h-full flex flex-col items-center justify-center p-4'>
                        <div className='size-10 bg-indigo-500 rounded-full flex items-center justify-center mb-3'>
                            <Plus className='w-5 h-5 text-white' />
                        </div>
                        <p className='text-sm font-medium text-slate-700 text-center'>Create Story</p>
                    </div>
                </div>

                {/* Story Cards */}
                {stories.map((story, index) => (
                    <div onClick={() => setViewStory(story)} key={story._id || index}
                        className='relative rounded-lg shadow min-w-32 max-w-32 max-h-40 aspect-[3/4] cursor-pointer hover:shadow-lg transition-all duration-200 bg-gradient-to-b from-indigo-500 to-purple-600 hover:from-indigo-700 hover:to-purple-800 active:scale-95'>
                        <img src={getProfilePic(story.user)} alt=''
                            className='absolute size-8 top-3 left-3 z-10 rounded-full ring ring-gray-100 shadow object-cover' />
                        <p className='absolute top-16 left-3 text-white/60 text-sm truncate max-w-24'>{story.content}</p>
                        <p className='text-white absolute bottom-1 right-2 z-10 text-xs'>{moment(story.createdAt).fromNow()}</p>
                        {story.media_type !== 'text' && (
                            <div className='absolute inset-0 z-1 rounded-lg bg-black overflow-hidden'>
                                {story.media_type === 'image'
                                    ? <img src={story.media_url} alt='Story' className='w-full h-full object-cover opacity-70 hover:opacity-80 hover:scale-110 transition duration-500' />
                                    : <video src={story.media_url} className='w-full h-full object-cover opacity-70' />}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {showModel && <StoriesModel setShowModel={setShowModel} fetchStories={fetchStories} />}
            {viewStory && <StoryViewer viewStory={viewStory} setViewStory={setViewStory} />}
        </div>
    )
}

export default StoriesBar
