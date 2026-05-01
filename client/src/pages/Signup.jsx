import React, { useState } from 'react'
import { assets } from '../assets/assets'
import { Star, Eye, EyeOff } from 'lucide-react'
import { Link, useNavigate } from 'react-router'
import { useAppContext } from '../context/AppContext'
import { api } from '../lib/api'
import toast from 'react-hot-toast'

const Signup = () => {
  const { login } = useAppContext()
  const navigate = useNavigate()
  const [form, setForm] = useState({ full_name: '', email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    try {
      const res = await api.signup(form)
      login(res.user, res.token)
      toast.success(`Welcome to PingUp, ${res.user.full_name}!`)
      navigate('/')
    } catch (err) {
      toast.error(err.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='min-h-screen flex flex-col md:flex-row'>
      <img src={assets.bgImage} alt='' className='absolute top-0 left-0 -z-10 w-full h-full object-cover' />

      {/* Left — Branding */}
      <div className='flex-1 flex flex-col items-start justify-between p-6 md:p-10 lg:pl-40'>
        <img src={assets.logo} alt='Logo' className='h-12 object-contain' />
        <div>
          <div className='flex items-center gap-4 mb-4 max-md:mt-10'>
            <img src={assets.group_users} alt='' className='h-8 md:h-10' />
            <div>
              <div className='flex'>
                {Array(5).fill(0).map((_, i) => (
                  <Star key={i} className='size-4 text-transparent fill-amber-500' />
                ))}
              </div>
              <p>Join 12k+ people on PingUp</p>
            </div>
          </div>
          <h1 className='text-3xl md:text-5xl md:pb-2 font-bold bg-gradient-to-r from-indigo-950 to-indigo-800 bg-clip-text text-transparent'>
            Start your journey today
          </h1>
          <p className='text-xl md:text-2xl text-indigo-900 max-w-md'>
            Connect with a global community on PingUp
          </p>
        </div>
        <span className='md:h-10' />
      </div>

      {/* Right — Signup Form */}
      <div className='flex-1 flex items-center justify-center p-6 sm:p-10'>
        <div className='bg-white/90 backdrop-blur rounded-2xl shadow-xl p-8 w-full max-w-md'>
          <h2 className='text-2xl font-bold text-slate-800 mb-1'>Create your account</h2>
          <p className='text-slate-500 text-sm mb-6'>Join PingUp and connect with the world</p>

          <form onSubmit={handleSubmit} className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Full Name</label>
              <input
                type='text' required
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                placeholder='Ahmad Ali'
                className='w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Email</label>
              <input
                type='email' required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder='you@example.com'
                className='w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Password</label>
              <div className='relative'>
                <input
                  type={showPassword ? 'text' : 'password'} required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder='Min 6 characters'
                  className='w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 pr-10'
                />
                <button type='button' onClick={() => setShowPassword(!showPassword)}
                  className='absolute right-3 top-3.5 text-gray-400 cursor-pointer'>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type='submit' disabled={loading}
              className='w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium rounded-lg transition active:scale-95 disabled:opacity-60 cursor-pointer'>
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p className='text-center text-sm text-gray-500 mt-6'>
            Already have an account?{' '}
            <Link to='/login' className='text-indigo-600 font-medium hover:underline'>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Signup
