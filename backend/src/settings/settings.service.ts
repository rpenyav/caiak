import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Settings } from './settings.schema';
import { SettingsDto } from './dto/settings.dto';

@Injectable()
export class SettingsService {
  constructor(
    @InjectModel(Settings.name) private readonly settingsModel: Model<Settings>,
  ) {}

  async createOrUpdate(
    userId: string,
    settingsDto: SettingsDto,
  ): Promise<Settings> {
    const existingSettings = await this.settingsModel
      .findOne({ userId })
      .exec();

    if (existingSettings) {
      const updatedSettings = await this.settingsModel
        .findOneAndUpdate({ userId }, { $set: settingsDto }, { new: true })
        .exec();

      if (!updatedSettings) {
        throw new NotFoundException(
          `Configuraciones para el usuario "${userId}" no encontradas`,
        );
      }

      return updatedSettings;
    }

    const settings = new this.settingsModel({
      userId,
      ...settingsDto,
    });
    return settings.save();
  }

  async update(userId: string, settingsDto: SettingsDto): Promise<Settings> {
    const updatedSettings = await this.settingsModel
      .findOneAndUpdate({ userId }, { $set: settingsDto }, { new: true })
      .exec();

    if (!updatedSettings) {
      throw new NotFoundException(
        `Configuraciones para el usuario "${userId}" no encontradas`,
      );
    }

    return updatedSettings;
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
