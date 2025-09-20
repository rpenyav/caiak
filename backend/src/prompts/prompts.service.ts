import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Prompt } from './prompts.schema';
import { PromptDto } from './dto/prompt.dto';

@Injectable()
export class PromptsService {
  constructor(
    @InjectModel(Prompt.name) private readonly promptModel: Model<Prompt>,
  ) {}

  async createOrUpdate(promptDto: PromptDto): Promise<Prompt> {
    const { appId, prompt } = promptDto;

    const existingPrompt = await this.promptModel.findOne({ appId }).exec();

    if (existingPrompt) {
      const updatedPrompt = await this.promptModel
        .findOneAndUpdate({ appId }, { $set: { prompt } }, { new: true })
        .exec();

      if (!updatedPrompt) {
        throw new NotFoundException(
          `Prompt para el appId "${appId}" no encontrado`,
        );
      }

      return updatedPrompt;
    }

    const newPrompt = new this.promptModel(promptDto);
    return newPrompt.save();
  }

  async update(promptDto: PromptDto): Promise<Prompt> {
    const { appId, prompt } = promptDto;

    const updatedPrompt = await this.promptModel
      .findOneAndUpdate({ appId }, { $set: { prompt } }, { new: true })
      .exec();

    if (!updatedPrompt) {
      throw new NotFoundException(
        `Prompt para el appId "${appId}" no encontrado`,
      );
    }

    return updatedPrompt;
  }

  async findByAppId(appId: string): Promise<Prompt> {
    const prompt = await this.promptModel.findOne({ appId }).exec();
    if (!prompt) {
      throw new NotFoundException(
        `Prompt para el appId "${appId}" no encontrado`,
      );
    }
    return prompt;
  }

  async findFirstPrompt(): Promise<Prompt> {
    const prompt = await this.promptModel.findOne().exec();
    if (!prompt) {
      throw new NotFoundException(
        'No se encontraron prompts en la base de datos',
      );
    }
    return prompt;
  }
}
