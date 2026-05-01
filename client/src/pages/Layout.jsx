import React, { useState } from 'react'
import Sidebar from '../components/Sidebar'
import { Outlet } from 'react-router'
import { Menu, X } from 'lucide-react'
import Loading from '../components/Loading'
import { useAppContext } from '../context/AppContext'

const Layout = () => {
  const { dbUser, loading } = useAppContext()
  const [SidebarOpen, setSidebarOpen] = useState(false)

  if (loading) return <Loading />

  return (
    <div className='w-full flex h-screen'>
      <Sidebar SidebarOpen={SidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className='flex-1 bg-slate-50 overflow-hidden'>
        <Outlet />
      </div>
      {SidebarOpen
        ? <X className='absolute top-3 right-3 p-2 z-50 bg-white rounded-md shadow w-10 h-10 text-gray-600 sm:hidden' onClick={() => setSidebarOpen(false)} />
        : <Menu className='absolute top-3 right-3 p-2 z-50 bg-white rounded-md shadow w-10 h-10 text-gray-600 sm:hidden' onClick={() => setSidebarOpen(true)} />
      }
    </div>
  )
}

export default Layout
