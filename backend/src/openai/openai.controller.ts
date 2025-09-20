import {
  Controller,
  Get,
  Post,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { OpenaiService } from './openai.service';

@Controller('openai')
export class OpenaiController {
  constructor(private readonly openaiService: OpenaiService) {}

  @Get('test')
  async testConnection() {
    try {
      return await this.openaiService.testConnection();
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('generate')
  async generateResponse(@Body('message') message: string) {
    if (!message) {
      throw new HttpException(
        'El campo "message" es requerido',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const response = await this.openaiService.generateResponse(message);
      return { response, typingConfig: this.openaiService.getTypingConfig() };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
