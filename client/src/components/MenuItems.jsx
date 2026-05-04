import React, { useEffect, useState } from 'react'
import { menuItemsData } from '../assets/assets'
import { NavLink } from 'react-router'
import { Bell } from 'lucide-react'
import { api } from '../lib/api'

const MenuItems = ({ setSidebarOpen }) => {
    const [unreadCount, setUnreadCount] = useState(0)

    useEffect(() => {
        const fetchCount = () => {
            api.getUnreadNotificationsCount()
                .then((data) => setUnreadCount(data.count || 0))
                .catch(() => { })
        }
        fetchCount()
        const interval = setInterval(fetchCount, 30000)
        return () => clearInterval(interval)
    }, [])

    return (
        <div className='px-4 text-gray-600 space-y-1 font-medium'>
            {
                menuItemsData.map(({ to, label, Icon }) => (
                    <NavLink
                        key={to}
                        to={to}
                        end={to === '/'}
                        onClick={() => setSidebarOpen(false)}
                        className={({ isActive }) =>
                            `px-3.5 py-2 flex items-center gap-3 rounded-xl ${isActive
                                ? 'bg-indigo-50 text-indigo-700'
                                : 'hover:bg-gray-50'
                            }`
                        }
                    >
                        <Icon className="w-5 h-5" />
                        {label}
                    </NavLink>
                ))
            }
            <NavLink
                to='/notifications'
                onClick={() => { setSidebarOpen(false); setUnreadCount(0) }}
                className={({ isActive }) =>
                    `px-3.5 py-2 flex items-center gap-3 rounded-xl ${isActive
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'hover:bg-gray-50'
                    }`
                }
            >
                <div className='relative'>
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                        <span className='absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold'>
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </div>
                Notifications
            </NavLink>
        </div>
    )
}

export default MenuItems