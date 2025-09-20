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
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { GetUsersQueryDto } from './dto/get-users-query.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  @UseGuards(JwtAuthGuard) // Proteger registro
  async register(@Body() createUserDto: CreateUserDto) {
    try {
      return await this.usersService.create(createUserDto);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto) {
    try {
      return await this.usersService.login(loginUserDto);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get()
  @UseGuards(JwtAuthGuard) // Proteger listado
  async findAll(@Query() query: GetUsersQueryDto) {
    try {
      return await this.usersService.findAll(query);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard) // Proteger búsqueda por ID
  async findById(@Param('id') id: string) {
    try {
      return await this.usersService.findById(id);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }
}
