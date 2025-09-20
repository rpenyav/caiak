import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Request,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { SettingsService } from './settings.service';
import { SettingsDto } from './dto/settings.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('settings')
@UseGuards(JwtAuthGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Post()
  async createOrUpdate(@Request() req, @Body() settingsDto: SettingsDto) {
    try {
      const userId = req.user?.sub || req.user?.id;
      if (!userId) {
        throw new BadRequestException(
          'ID de usuario no encontrado en el token JWT',
        );
      }
      return await this.settingsService.createOrUpdate(userId, settingsDto);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get()
  async findByUser(@Request() req) {
    try {
      const userId = req.user?.sub || req.user?.id;
      if (!userId) {
        throw new BadRequestException(
          'ID de usuario no encontrado en el token JWT',
        );
      }
      return await this.settingsService.findByUserId(userId);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Put()
  async update(@Request() req, @Body() settingsDto: SettingsDto) {
    try {
      const userId = req.user?.sub || req.user?.id;
      if (!userId) {
        throw new BadRequestException(
          'ID de usuario no encontrado en el token JWT',
        );
      }
      return await this.settingsService.update(userId, settingsDto);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
