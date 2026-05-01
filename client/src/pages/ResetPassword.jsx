import React, { useState } from 'react'
import { assets } from '../assets/assets'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { api } from '../lib/api'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'
import { Eye, EyeOff } from 'lucide-react'

const ResetPassword = () => {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const { login } = useAppContext()
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password !== confirm) { toast.error('Passwords do not match'); return }
    if (password.length < 6) { toast.error('Password must be at least 6 characters'); return }

    setLoading(true)
    try {
      const res = await api.resetPassword({ token, password })
      if (res.token) {
        login(null, res.token) // token only, user will be fetched by AppContext
      }
      toast.success('Password reset! Please log in.')
      navigate('/login')
    } catch (err) {
      toast.error(err.message || 'Reset failed — link may be expired')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center p-4'>
      <img src={assets.bgImage} alt='' className='absolute top-0 left-0 -z-10 w-full h-full object-cover' />

      <div className='bg-white/90 backdrop-blur rounded-2xl shadow-xl p-8 w-full max-w-md'>
        <h2 className='text-2xl font-bold text-slate-800 mb-1'>Set new password</h2>
        <p className='text-slate-500 text-sm mb-6'>Must be at least 6 characters</p>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='relative'>
            <input
              type={showPassword ? 'text' : 'password'} required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder='New password'
              className='w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 pr-10'
            />
            <button type='button' onClick={() => setShowPassword(!showPassword)}
              className='absolute right-3 top-3.5 text-gray-400 cursor-pointer'>
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <input
            type='password' required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder='Confirm new password'
            className='w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300'
          />

          <button type='submit' disabled={loading}
            className='w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-lg transition active:scale-95 disabled:opacity-60 cursor-pointer'>
            {loading ? 'Resetting…' : 'Reset Password'}
          </button>
        </form>

        <p className='text-center text-sm text-gray-500 mt-4'>
          <Link to='/login' className='text-indigo-600 hover:underline'>Back to login</Link>
        </p>
      </div>
    </div>
  )
}

export default ResetPassword
