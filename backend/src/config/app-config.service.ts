import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as cloudinary from 'cloudinary';

@Injectable()
export class AppConfigService {
  constructor(private configService: ConfigService) {}

  getCloudinary() {
    cloudinary.v2.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
    return cloudinary.v2;
  }
}
