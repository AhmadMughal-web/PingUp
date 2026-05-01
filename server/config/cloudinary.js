import dotenv from 'dotenv'
dotenv.config() // <--- Yeh line sabse upar add karein
import { v2 as cloudinary } from 'cloudinary'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import multer from 'multer'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Reusable factory — pass a folder name, get back a configured multer instance
export const createUploader = (folder, allowedFormats = ['jpg', 'jpeg', 'png', 'webp']) => {
  const storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: `pingup/${folder}`,
      allowed_formats: allowedFormats,
      transformation: [{ quality: 'auto', fetch_format: 'auto' }],
    },
  })
  return multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } }) // 10 MB max
}

// Story uploader allows video too
export const storyUploader = () => {
  const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => ({
      folder: 'pingup/stories',
      resource_type: file.mimetype.startsWith('video') ? 'video' : 'image',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'mp4', 'mov'],
      transformation: [{ quality: 'auto' }],
    }),
  })
  return multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } }) // 50 MB for video
}

export const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType })
  } catch (err) {
    console.error('Cloudinary delete error:', err)
  }
}

export default cloudinary
