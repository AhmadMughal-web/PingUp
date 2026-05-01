import React, { useEffect, useRef, useState } from 'react'
import { assets } from '../assets/assets'
import Loading from '../components/Loading'
import StoriesBar from '../components/StoriesBar'
import PostCard from '../components/PostCard'
import RecentMessages from '../components/RecentMessages'
import { api } from '../lib/api'

const Feed = () => {
  const [feeds, setFeeds] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const bottomRef = useRef(null)

  const fetchFeeds = async (pageNum = 1) => {
    try {
      const data = await api.getFeed(pageNum)
      if (pageNum === 1) {
        setFeeds(data.posts || [])
      } else {
        setFeeds((prev) => [...prev, ...(data.posts || [])])
      }
      setHasMore(data.hasMore ?? false)
    } catch {
      // Silent fail — backend not running yet
      setFeeds([])
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  useEffect(() => {
    fetchFeeds(1)
  }, [])

  // Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          const nextPage = page + 1
          setPage(nextPage)
          setLoadingMore(true)
          fetchFeeds(nextPage)
        }
      },
      { threshold: 0.5 }
    )
    if (bottomRef.current) observer.observe(bottomRef.current)
    return () => observer.disconnect()
  }, [hasMore, loadingMore, page])

  const handleLikeUpdate = (postId, newLikes) => {
    setFeeds((prev) =>
      prev.map((p) => (p._id === postId ? { ...p, likes_count: newLikes } : p))
    )
  }

  return !loading ? (
    <div className='h-full overflow-y-scroll no-scrollbar py-10 xl:pr-5 flex items-start justify-center xl:gap-5'>

      {/* Stories and Post List */}
      <div>
        <StoriesBar />
        <div className='p-4 space-y-6'>
          {feeds.length === 0 && (
            <div className='text-center text-gray-400 py-20'>
              <p className='text-lg font-medium'>No posts yet</p>
              <p className='text-sm mt-1'>Follow people or create your first post!</p>
            </div>
          )}
          {feeds.map((post) => (
            <PostCard key={post._id} post={post} onLikeUpdate={handleLikeUpdate} onDelete={(id) => setFeeds(prev => prev.filter(p => p._id !== id))} />
          ))}
          {loadingMore && <Loading height='60px' />}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Right Sidebar */}
      <div className='max-xl:hidden sticky top-0'>
        <div className='max-w-xs bg-white text-xs p-4 rounded-md inline-flex flex-col gap-2 shadow'>
          <h3 className='text-slate-800 font-semibold'>Sponsored</h3>
          <img src={assets.sponsored_img} alt='' className='w-72 h-52 rounded-md' />
          <p className='text-slate-600'>Email marketing</p>
          <p className='text-slate-400'>Supercharge your marketing with a powerful platform.</p>
        </div>
        <RecentMessages />
      </div>

    </div>
  ) : (
    <Loading />
  )
}

export default Feed
