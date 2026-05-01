import React from 'react'
import { assets } from '../assets/assets'
import { Link, useNavigate } from 'react-router'
import MenuItems from './MenuItems'
import { CirclePlus, LogOut } from 'lucide-react'
import { useAppContext } from '../context/AppContext'

const Sidebar = ({ SidebarOpen, setSidebarOpen }) => {
  const navigate = useNavigate()
  const { dbUser, logout } = useAppContext()

  const profilePic = dbUser?.profile_picture?.url || ''

  return (
    <div className={`w-60 xl:w-72 bg-white border-r border-gray-200 flex flex-col justify-between items-center max-sm:absolute top-0 bottom-0 z-20 ${SidebarOpen ? 'translate-x-0' : 'max-sm:-translate-x-full'} transition-all duration-300`}>
      <div className='w-full'>
        <img onClick={() => navigate('/')} src={assets.logo} alt='Logo' className='w-24 ml-7 my-2 cursor-pointer' />
        <hr className='border-gray-300 mb-8' />
        <MenuItems setSidebarOpen={setSidebarOpen} />
        <Link to='/create-post'
          className='flex items-center justify-center gap-2 py-2.5 mt-6 mx-6 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-700 hover:to-indigo-800 active:scale-95 transition text-white cursor-pointer'>
          <CirclePlus className='w-5 h-5' />
          Create Post
        </Link>
      </div>

      <div className='w-full border-t border-gray-200 p-4 px-7 flex items-center justify-between'>
        <div className='flex gap-2 items-center cursor-pointer' onClick={() => navigate('/profile')}>
          {profilePic
            ? <img src={profilePic} alt='' className='w-8 h-8 rounded-full object-cover' />
            : <div className='w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-sm font-bold'>
                {dbUser?.full_name?.[0]?.toUpperCase() || 'U'}
              </div>
          }
          <div>
            <h1 className='text-sm font-medium'>{dbUser?.full_name || '…'}</h1>
            <p className='text-xs text-gray-500'>@{dbUser?.username || 'set username'}</p>
          </div>
        </div>
        <LogOut
          onClick={logout}
          className='w-4 text-gray-400 hover:text-red-500 transition cursor-pointer'
        />
      </div>
    </div>
  )
}

export default Sidebar
