import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  BadRequestException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { GetUsersQueryDto } from './dto/get-users-query.dto';
import { AuthAndLogGuard } from '../common/guards/auth-and-log.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginUserDto) {
    return await this.usersService.login(loginDto);
  }

  @Get()
  @UseGuards(AuthAndLogGuard)
  async findAll(@Query() query: GetUsersQueryDto) {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  @UseGuards(AuthAndLogGuard)
  async findById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }
}
