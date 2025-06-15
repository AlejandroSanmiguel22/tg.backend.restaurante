import { v2 as cloudinary } from 'cloudinary'
import { CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_CLOUD_NAME } from '../../application/config'

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET
})

export class CloudinaryAdapter {
  static async uploadImage(base64Image: string): Promise<string> {
    const result = await cloudinary.uploader.upload(base64Image, {
      folder: 'restaurante/platos'
    })

    return result.secure_url
  }
}
