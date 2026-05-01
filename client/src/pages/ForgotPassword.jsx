import React, { useState } from 'react'
import { assets } from '../assets/assets'
import { Link } from 'react-router'
import { api } from '../lib/api'
import toast from 'react-hot-toast'
import { ArrowLeft, Mail } from 'lucide-react'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.forgotPassword({ email })
      setSent(true)
      toast.success('Reset instructions sent!')
    } catch (err) {
      toast.error(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center p-4'>
      <img src={assets.bgImage} alt='' className='absolute top-0 left-0 -z-10 w-full h-full object-cover' />

      <div className='bg-white/90 backdrop-blur rounded-2xl shadow-xl p-8 w-full max-w-md'>
        <Link to='/login' className='flex items-center gap-1 text-sm text-indigo-600 hover:underline mb-6'>
          <ArrowLeft size={16} /> Back to login
        </Link>

        {!sent ? (
          <>
            <div className='w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4'>
              <Mail className='text-indigo-600' size={22} />
            </div>
            <h2 className='text-2xl font-bold text-slate-800 mb-1'>Forgot password?</h2>
            <p className='text-slate-500 text-sm mb-6'>
              Enter your email and we'll send you a reset link
            </p>

            <form onSubmit={handleSubmit} className='space-y-4'>
              <input
                type='email' required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder='you@example.com'
                className='w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300'
              />
              <button type='submit' disabled={loading}
                className='w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-lg transition active:scale-95 disabled:opacity-60 cursor-pointer'>
                {loading ? 'Sending…' : 'Send Reset Link'}
              </button>
            </form>
          </>
        ) : (
          <div className='text-center py-4'>
            <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <Mail className='text-green-600' size={28} />
            </div>
            <h2 className='text-xl font-bold text-slate-800 mb-2'>Check your email</h2>
            <p className='text-slate-500 text-sm'>
              We sent password reset instructions to <strong>{email}</strong>
            </p>
            <Link to='/login'
              className='mt-6 inline-block text-sm text-indigo-600 hover:underline'>
              Back to login
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default ForgotPassword
