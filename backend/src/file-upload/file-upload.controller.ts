import {
  Controller,
  Post,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileUploadService } from './file-upload.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('file-upload')
@UseGuards(JwtAuthGuard)
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No se proporcionó ningún archivo');
    }
    const uploadResult = await this.fileUploadService.uploadFile(file);
    return { fileUrl: uploadResult.secure_url };
  }
}
