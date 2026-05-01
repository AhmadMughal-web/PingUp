import React, { useEffect, useState, useCallback } from 'react'
import { Search } from 'lucide-react'
import UserCard from '../components/UserCard'
import Loading from '../components/Loading'
import { api } from '../lib/api'
import toast from 'react-hot-toast'

const Discover = () => {
  const [input, setInput] = useState('')
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchUsers = async (query = '') => {
    setLoading(true)
    try {
      const data = await api.discoverUsers(query)
      setUsers(data.users || [])
    } catch {
      // silent fail
    } finally {
      setLoading(false)
    }
  }

  // Load suggestions on mount
  useEffect(() => { fetchUsers() }, [])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') fetchUsers(input)
  }

  return (
    <div className='min-h-screen bg-gradient-to-b from-slate-50 to-white'>
      <div className='max-w-6xl mx-auto p-6'>

        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-slate-900 mb-2'>Discover People</h1>
          <p className='text-slate-600'>Connect with amazing people and grow your network</p>
        </div>

        {/* Search */}
        <div className='mb-8 shadow-md rounded-md border border-slate-200/60 bg-white/80'>
          <div className='p-6'>
            <div className='relative'>
              <Search className='absolute top-1/2 left-3 transform -translate-y-1/2 text-slate-500 w-5 h-5' />
              <input
                type='text'
                placeholder='Search by name, username, or bio… press Enter'
                className='pl-10 sm:pl-12 py-2 w-full border border-gray-300 rounded-md max-sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300'
                onChange={(e) => setInput(e.target.value)}
                value={input}
                onKeyDown={handleKeyDown}
              />
            </div>
          </div>
        </div>

        {loading ? (
          <Loading height='40vh' />
        ) : (
          <div className='flex flex-wrap gap-6'>
            {users.length === 0 && (
              <p className='text-gray-400 py-10 w-full text-center'>No users found</p>
            )}
            {users.map((user) => (
              // FIX: key={user._id} not key={user}
              <UserCard user={user} key={user._id} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Discover
