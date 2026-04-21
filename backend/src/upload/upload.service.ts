import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

@Injectable()
export class UploadService {
  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadImage(
    file: Express.Multer.File,
    folder: string = 'armalegal',
  ): Promise<{ url: string; publicId: string }> {
    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('Solo se permiten imágenes (JPEG, PNG, WebP)');
    }

    // Validar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new BadRequestException('La imagen no debe superar los 5MB');
    }

    try {
      // Convertir buffer a base64
      const base64Image = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

      const result: UploadApiResponse = await cloudinary.uploader.upload(base64Image, {
        folder,
        transformation: [
          { width: 1200, height: 1200, crop: 'limit' },
          { quality: 'auto:good' },
          { fetch_format: 'auto' },
        ],
      });

      if (!result || !result.secure_url) {
        throw new BadRequestException('Error al procesar la imagen');
      }

      return {
        url: result.secure_url,
        publicId: result.public_id,
      };
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      throw new BadRequestException('Error al subir imagen a Cloudinary');
    }
  }

  async uploadMultipleImages(
    files: Array<Express.Multer.File>,
    folder: string = 'armalegal/products',
  ): Promise<Array<{ url: string; publicId: string }>> {
    if (files.length > 10) {
      throw new BadRequestException('Máximo 10 imágenes permitidas');
    }

    const uploadPromises = files.map((file) => this.uploadImage(file, folder));
    return Promise.all(uploadPromises);
  }

  async deleteImage(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.error('Error al eliminar imagen:', error);
    }
  }
}