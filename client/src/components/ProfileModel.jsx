import React, { useState } from 'react'
import { Pencil, X } from 'lucide-react'
import { useAppContext } from '../context/AppContext'
import { api } from '../lib/api'
import toast from 'react-hot-toast'

const ProfileModel = ({ setShowEdit, onSaved }) => {
    const { dbUser, refreshUser } = useAppContext()

    const [editForm, setEditForm] = useState({
        full_name: dbUser?.full_name || '',
        username: dbUser?.username || '',
        bio: dbUser?.bio || '',
        location: dbUser?.location || '',
        profile_picture: null,
        cover_photo: null,
    })
    const [saving, setSaving] = useState(false)

    const profilePreview = editForm.profile_picture
        ? URL.createObjectURL(editForm.profile_picture)
        : (dbUser?.profile_picture?.url || '')

    const coverPreview = editForm.cover_photo
        ? URL.createObjectURL(editForm.cover_photo)
        : (dbUser?.cover_photo?.url || '')

    const handleSaveProfile = async (e) => {
        e.preventDefault()
        setSaving(true)
        try {
            await api.updateProfile({
                full_name: editForm.full_name,
                username: editForm.username,
                bio: editForm.bio,
                location: editForm.location,
            })
            if (editForm.profile_picture) {
                const fd = new FormData()
                fd.append('profile_picture', editForm.profile_picture)
                await api.updateProfilePicture(fd)
            }
            if (editForm.cover_photo) {
                const fd = new FormData()
                fd.append('cover_photo', editForm.cover_photo)
                await api.updateCoverPhoto(fd)
            }
            await refreshUser()
            toast.success('Profile updated!')
            onSaved?.()
        } catch (err) {
            toast.error(err.message || 'Failed to save profile')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className='fixed top-0 bottom-0 left-0 right-0 z-[110] h-screen overflow-y-scroll bg-black/50'>
            <div className='max-w-2xl sm:py-6 mx-auto'>
                <div className='bg-white rounded-lg shadow p-6'>

                    <div className='flex items-center justify-between mb-6'>
                        <h1 className='text-2xl font-bold text-slate-900'>Edit Profile</h1>
                        <button onClick={() => setShowEdit(false)} className='p-1 hover:bg-gray-100 rounded-full transition cursor-pointer'>
                            <X className='w-5 h-5 text-gray-500' />
                        </button>
                    </div>

                    <form className='space-y-5' onSubmit={handleSaveProfile}>

                        {/* Profile Picture */}
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>Profile Picture</label>
                            <label htmlFor='profile_picture' className='cursor-pointer inline-block'>
                                <div className='group/profile relative w-24 h-24'>
                                    <img src={profilePreview} alt='' className='w-24 h-24 rounded-full object-cover border-2 border-gray-200' />
                                    <div className='absolute inset-0 hidden group-hover/profile:flex bg-black/30 rounded-full items-center justify-center'>
                                        <Pencil className='w-4 h-4 text-white' />
                                    </div>
                                </div>
                                <input type='file' accept='image/*' id='profile_picture' hidden
                                    onChange={(e) => setEditForm({ ...editForm, profile_picture: e.target.files[0] })} />
                            </label>
                        </div>

                        {/* Cover Photo */}
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>Cover Photo</label>
                            <label htmlFor='cover_photo' className='cursor-pointer block'>
                                <div className='group/cover relative w-full h-36 rounded-lg overflow-hidden bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200'>
                                    {coverPreview && <img src={coverPreview} alt='' className='w-full h-full object-cover' />}
                                    <div className='absolute inset-0 hidden group-hover/cover:flex bg-black/20 items-center justify-center'>
                                        <Pencil className='w-5 h-5 text-white' />
                                    </div>
                                </div>
                                <input type='file' accept='image/*' id='cover_photo' hidden
                                    onChange={(e) => setEditForm({ ...editForm, cover_photo: e.target.files[0] })} />
                            </label>
                        </div>

                        {/* Full Name */}
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>Name</label>
                            <input type='text' value={editForm.full_name}
                                onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                                placeholder='Your full name'
                                className='w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300' />
                        </div>

                        {/* Username */}
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>Username</label>
                            <input type='text' value={editForm.username}
                                onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                                placeholder='your_username'
                                className='w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300' />
                        </div>

                        {/* Bio */}
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>Bio</label>
                            <textarea rows={3} value={editForm.bio}
                                onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                                placeholder='Tell the world about yourself'
                                className='w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none' />
                        </div>

                        {/* Location */}
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>Location</label>
                            <input type='text' value={editForm.location}
                                onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                                placeholder='City, Country'
                                className='w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300' />
                        </div>

                        {/* Buttons */}
                        <div className='flex justify-end gap-3 pt-2'>
                            <button type='button' onClick={() => setShowEdit(false)}
                                className='px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition cursor-pointer'>
                                Cancel
                            </button>
                            <button type='submit' disabled={saving}
                                className='px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition cursor-pointer disabled:opacity-60'>
                                {saving ? 'Saving…' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default ProfileModel
