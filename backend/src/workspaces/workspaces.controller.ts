import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { WorkspacesService } from './workspaces.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { GetWorkspacesQueryDto } from './dto/get-workspaces-query.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';

@Controller('workspaces')
@UseGuards(JwtAuthGuard) // Requiere autenticación JWT para todos los endpoints
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Post()
  @UseGuards(RolesGuard) // Verifica roles para crear workspace
  async create(@Body() createWorkspaceDto: CreateWorkspaceDto) {
    try {
      return await this.workspacesService.create(createWorkspaceDto);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get()
  async findAll(@Query() query: GetWorkspacesQueryDto) {
    try {
      return await this.workspacesService.findAll(query);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
