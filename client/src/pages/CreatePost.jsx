import React, { useState } from 'react'
import { Image, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router'
import { useAppContext } from '../context/AppContext'
import { api } from '../lib/api'

const CreatePost = () => {
  const { dbUser } = useAppContext()
  const navigate = useNavigate()

  const [content, setContent] = useState('')
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(false)

  const profilePic = typeof dbUser?.profile_picture === 'string'
    ? dbUser.profile_picture
    : dbUser?.profile_picture?.url || ''

  const handleSubmit = async () => {
    if (!content.trim() && images.length === 0) {
      throw new Error('Add some text or an image first')
    }
    setLoading(true)
    try {
      const fd = new FormData()
      if (content) fd.append('content', content)
      images.forEach((img) => fd.append('images', img))
      await api.createPost(fd)
      setContent('')
      setImages([])
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='min-h-screen bg-gradient-to-b from-slate-50 to-white'>
      <div className='max-w-6xl mx-auto p-6'>

        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-slate-900 mb-2'>Create Post</h1>
          <p className='text-slate-600'>Share your thoughts with the world</p>
        </div>

        <div className='max-w-xl bg-white p-4 sm:p-8 sm:pb-4 rounded-xl shadow-md space-y-4'>
          {/* Author header */}
          <div className='flex items-center gap-3'>
            <img src={profilePic} alt='' className='w-12 h-12 rounded-full shadow object-cover' />
            <div>
              <h2 className='font-semibold'>{dbUser?.full_name}</h2>
              <p className='text-sm text-gray-500'>@{dbUser?.username}</p>
            </div>
          </div>

          {/* Text area */}
          <textarea
            className='w-full resize-none min-h-24 mt-4 text-sm outline-none placeholder-gray-400'
            placeholder="What's happening?"
            onChange={(e) => setContent(e.target.value)}
            value={content}
          />

          {/* Image previews */}
          {images.length > 0 && (
            <div className='flex flex-wrap gap-2 pt-2'>
              {images.map((img, i) => (
                <div key={i} className='relative group'>
                  <img src={URL.createObjectURL(img)} alt='' className='h-20 rounded-md object-cover' />
                  <div
                    onClick={() => setImages(images.filter((_, idx) => idx !== i))}
                    className='absolute hidden group-hover:flex justify-center items-center inset-0 bg-black/40 rounded-md cursor-pointer'>
                    <X className='h-6 w-6 text-white' />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Bottom bar */}
          <div className='flex items-center justify-between pt-3 border-t border-gray-200'>
            <label htmlFor='post-images' className='flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition cursor-pointer'>
              <Image className='size-6' />
              <span className='text-xs'>Photo</span>
            </label>
            {/* FIX: accept='image/*' (was 'images/*') */}
            <input type='file' id='post-images' accept='image/*' hidden multiple
              onChange={(e) => setImages([...images, ...e.target.files])} />

            <button
              disabled={loading}
              onClick={() => toast.promise(handleSubmit(), {
                loading: 'Uploading…',
                success: 'Post published!',
                error: (e) => e.message || 'Could not publish post',
              })}
              className='text-sm bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 active:scale-95 transition text-white font-medium px-8 py-2 rounded-md cursor-pointer disabled:opacity-60'>
              Publish Post
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreatePost
