import React, { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router'
import { ImageIcon, SendHorizonal, Trash2, MoreVertical, Check, CheckCheck } from 'lucide-react'
import { useAppContext } from '../context/AppContext'
import { api } from '../lib/api'
import Loading from '../components/Loading'
import toast from 'react-hot-toast'

const ChatBox = () => {
  const { userid } = useParams()
  const { dbUser, socket, isOnline } = useAppContext()
  const [activeMenu, setActiveMenu] = useState(null)
  const [partner, setPartner] = useState(null)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [image, setImage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (!userid) return
    setLoading(true)
    api.getConversation(userid)
      .then((data) => { setMessages(data.messages); setPartner(data.partner) })
      .catch(() => { })
      .finally(() => setLoading(false))
  }, [userid])

  useEffect(() => {
    if (!socket) return
    const handler = (msg) => {
      if (
        (msg.from_user === userid && msg.to_user === dbUser?._id) ||
        (msg.from_user === dbUser?._id && msg.to_user === userid)
      ) {
        setMessages((prev) => [...prev, msg])
      }
    }
    socket.on('message:new', handler)

    // Partner ne messages dekhe — sab seen ho gaye
    const seenHandler = ({ from_user_id }) => {
      if (from_user_id === dbUser?._id) {
        setMessages(prev => prev.map(m => ({ ...m, seen: true })))
      }
    }
    socket.on('messages:seen', seenHandler)

    return () => {
      socket.off('message:new', handler)
      socket.off('messages:seen', seenHandler)
    }
  }, [socket, userid, dbUser])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Close menu when clicking outside
  useEffect(() => {
    const handler = () => setActiveMenu(null)
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [])

  const sendMessage = async () => {
    if (!text.trim() && !image) return
    setSending(true)
    try {
      const fd = new FormData()
      fd.append('to_user_id', userid)
      if (text) fd.append('text', text)
      if (image) fd.append('image', image)
      const res = await api.sendMessage(fd)
      setMessages((prev) => [...prev, res.message])
      setText('')
      setImage(null)
    } catch {
      toast.error('Message not sent')
    } finally {
      setSending(false)
    }
  }

  const handleDeleteMessage = async (messageId) => {
    setActiveMenu(null)
    const token = localStorage.getItem('pingup_token')
    const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/messages/${messageId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const data = await res.json()
    if (data.success) setMessages(prev => prev.filter(m => m._id !== messageId))
    else toast.error('Could not delete')
  }

  const partnerPic = typeof partner?.profile_picture === 'string'
    ? partner.profile_picture
    : partner?.profile_picture?.url || ''

  if (loading) return <Loading />

  return (
    <div className='flex flex-col h-screen'>
      {/* Header */}
      <div className='flex items-center gap-2 p-2 md:px-10 xl:pl-12 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-300'>
        <img src={partnerPic} alt='' className='size-8 rounded-full object-cover' />
        <div>
          <p className='font-medium'>{partner?.full_name}</p>
          <p className='text-sm text-gray-500 -mt-1.5'>@{partner?.username}</p>
        </div>
      </div>

      {/* Messages */}
      <div className='p-5 md:px-10 h-full overflow-y-scroll'>
        <div className='space-y-4 max-w-4xl mx-auto'>
          {messages.map((message, index) => {
            const isMine = message.from_user === dbUser?._id ||
              message.from_user?.toString() === dbUser?._id?.toString()
            return (
              <div key={index} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                {/* Message bubble with 3-dot inside */}
                <div className={`relative group/msg max-w-sm`}>
                  {/* 3-dot — top right corner of bubble */}
                  {isMine && (
                    <div
                      className='absolute -top-2 -right-2 z-10 opacity-0 group-hover/msg:opacity-100 transition'
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => setActiveMenu(activeMenu === message._id ? null : message._id)}
                        className='bg-white shadow rounded-full p-0.5 text-gray-400 hover:text-gray-700 cursor-pointer border border-gray-100'>
                        <MoreVertical className='w-3.5 h-3.5' />
                      </button>
                      {activeMenu === message._id && (
                        <div className='absolute top-5 right-0 bg-white rounded-xl shadow-xl border border-gray-100 w-32 z-50 overflow-hidden'>
                          <button
                            onClick={() => handleDeleteMessage(message._id)}
                            className='w-full flex items-center gap-2 px-3 py-2.5 hover:bg-red-50 text-red-500 text-sm cursor-pointer'>
                            <Trash2 className='w-3.5 h-3.5' /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Bubble */}
                  <div className={`p-2 text-sm bg-white text-slate-700 rounded-lg shadow ${isMine ? 'rounded-br-none bg-indigo-50' : 'rounded-bl-none'}`}>
                    {message.message_type === 'image' && (
                      <img src={message.media_url} alt='' className='w-full rounded-lg mb-1' />
                    )}
                    {message.text && (
                      <div className='flex items-end gap-2'>
                        <p>{message.text}</p>
                        {isMine && (
                          <span className='flex-shrink-0'>
                            {message.seen
                              ? <CheckCheck className='w-3.5 h-3.5 text-blue-500' />
                              : isOnline(userid)
                                ? <CheckCheck className='w-3.5 h-3.5 text-gray-400' />
                                : <Check className='w-3.5 h-3.5 text-gray-400' />
                            }
                          </span>
                        )}
                      </div>
                    )}
                    {message.message_type === 'image' && isMine && (
                      <div className='flex justify-end mt-0.5'>
                        {message.seen
                          ? <CheckCheck className='w-3.5 h-3.5 text-blue-500' />
                          : isOnline(userid)
                            ? <CheckCheck className='w-3.5 h-3.5 text-gray-400' />
                            : <Check className='w-3.5 h-3.5 text-gray-400' />
                        }
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className='px-4 pb-4'>
        <div className='flex items-center gap-3 pl-5 p-1.5 bg-white w-full max-w-xl mx-auto border border-gray-200 shadow rounded-full'>
          <input
            type='text'
            value={text}
            placeholder='Type a message…'
            onKeyDown={(e) => e.key === 'Enter' && !sending && sendMessage()}
            onChange={(e) => setText(e.target.value)}
            className='flex-1 outline-none text-slate-700'
          />
          <label htmlFor='chat-image' className='cursor-pointer'>
            {image
              ? <img src={URL.createObjectURL(image)} alt='' className='h-8 rounded' />
              : <ImageIcon className='size-7 text-gray-400' />}
            <input type='file' id='chat-image' accept='image/*' hidden
              onChange={(e) => setImage(e.target.files[0])} />
          </label>
          <button onClick={sendMessage} disabled={sending}
            className='bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-700 hover:to-purple-800 active:scale-95 cursor-pointer text-white p-2 rounded-full disabled:opacity-60'>
            <SendHorizonal size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChatBox