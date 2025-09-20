import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { UploadApiResponse } from 'cloudinary';

@Injectable()
export class FileUploadService {
  constructor(private readonly configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadFile(file: Express.Multer.File): Promise<UploadApiResponse> {
    try {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { resource_type: 'auto' },
          (error, result) => {
            if (error) {
              reject(
                new BadRequestException(
                  `Error al subir archivo: ${error.message}`,
                ),
              );
            } else if (!result) {
              reject(
                new BadRequestException('No se recibió resultado de la subida'),
              );
            } else {
              resolve(result as UploadApiResponse);
            }
          },
        );
        uploadStream.end(file.buffer);
      });
    } catch (error) {
      throw new BadRequestException(`Error al subir archivo: ${error.message}`);
    }
  }
}
