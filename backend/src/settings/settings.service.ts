import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Settings } from './settings.schema';
import { CreateSettingsDto } from './dto/create-settings.dto';

@Injectable()
export class SettingsService {
  constructor(
    @InjectModel(Settings.name) private readonly settingsModel: Model<Settings>,
  ) {}

  async createOrUpdate(
    userId: string,
    createSettingsDto: CreateSettingsDto,
  ): Promise<Settings> {
    const existingSettings = await this.settingsModel
      .findOne({ userId })
      .exec();

    if (existingSettings) {
      // Actualizar configuraciones existentes
      return this.settingsModel
        .findOneAndUpdate(
          { userId },
          { $set: createSettingsDto },
          { new: true },
        )
        .exec();
    }

    // Crear nuevas configuraciones
    const settings = new this.settingsModel({
      userId,
      ...createSettingsDto,
    });
    return settings.save();
  }

  async findByUserId(userId: string): Promise<Settings> {
    const settings = await this.settingsModel.findOne({ userId }).exec();
    if (!settings) {
      throw new NotFoundException(
        `Configuraciones para el usuario "${userId}" no encontradas`,
      );
    }
    return settings;
  }
}
