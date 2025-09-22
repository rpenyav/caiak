// src/conversations/conversations.controller.ts
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
import { UserId } from '../auth/user-id.decorator';

@Controller('conversations')
@UseGuards(JwtAuthGuard)
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Post()
  @UseGuards(RolesGuard)
  async create(@Body() dto: CreateConversationDto, @UserId() userId: string) {
    try {
      if (!userId) throw new BadRequestException('Usuario no autenticado');
      return await this.conversationsService.create(dto, userId);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get()
  async findAll(
    @Query() query: GetConversationsQueryDto,
    @UserId() userId: string,
  ) {
    try {
      if (!userId) throw new BadRequestException('Usuario no autenticado');
      return await this.conversationsService.findAll(query, userId);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get('workspace/:workspaceSlug')
  @UseGuards(RolesGuard)
  async findAllByWorkspace(
    @Param('workspaceSlug') workspaceSlug: string,
    @UserId() userId: string,
  ) {
    try {
      if (!userId) throw new BadRequestException('Usuario no autenticado');
      return await this.conversationsService.findAllByWorkspace(
        workspaceSlug,
        userId,
      );
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get(':id')
  async findById(@Param('id') id: string, @UserId() userId: string) {
    try {
      if (!userId) throw new BadRequestException('Usuario no autenticado');
      return await this.conversationsService.findById(id, userId);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }
}
