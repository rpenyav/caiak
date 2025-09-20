import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PromptsService } from './prompts.service';
import { PromptDto } from './dto/prompt.dto';

@Controller('prompts')
export class PromptsController {
  constructor(private readonly promptsService: PromptsService) {}

  @Post()
  async createOrUpdate(@Body() promptDto: PromptDto) {
    try {
      return await this.promptsService.createOrUpdate(promptDto);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Put()
  async update(@Body() promptDto: PromptDto) {
    try {
      return await this.promptsService.update(promptDto);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get(':appId')
  async findByAppId(@Param('appId') appId: string) {
    try {
      return await this.promptsService.findByAppId(appId);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }
}
