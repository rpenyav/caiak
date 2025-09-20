import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Param,
  BadRequestException,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { GetConversationsQueryDto } from './dto/get-conversations-query.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';

@Controller('conversations')
@UseGuards(JwtAuthGuard)
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Post()
  @UseGuards(RolesGuard)
  async create(@Body() createConversationDto: CreateConversationDto) {
    try {
      return await this.conversationsService.create(createConversationDto);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get()
  async findAll(@Query() query: GetConversationsQueryDto) {
    try {
      return await this.conversationsService.findAll(query);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get('workspace/:workspaceSlug')
  @UseGuards(RolesGuard)
  async findAllByWorkspace(@Param('workspaceSlug') workspaceSlug: string) {
    try {
      return await this.conversationsService.findAllByWorkspace(workspaceSlug);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    try {
      return await this.conversationsService.findById(id);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }
}
