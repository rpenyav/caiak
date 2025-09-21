import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, SortOrder } from 'mongoose';
import { User, UserDocument } from './users.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { GetUsersQueryDto } from './dto/get-users-query.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { username, password, roles } = createUserDto;

    // Verificar si el username ya existe
    const existingUser = await this.userModel.findOne({ username }).exec();
    if (existingUser) {
      throw new BadRequestException('El username ya está registrado');
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new this.userModel({
      username,
      password: hashedPassword,
      roles: roles || [],
    });

    return newUser.save();
  }

  async login(loginUserDto: LoginUserDto): Promise<{ accessToken: string }> {
    const { username, password } = loginUserDto;

    // Buscar usuario por username
    const user = await this.userModel.findOne({ username }).exec();
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Generar token JWT con appId
    const payload = {
      username: user.username,
      sub: user._id,
      roles: user.roles,
      appId: 'caiak-app-1',
    };
    const accessToken = this.jwtService.sign(payload);

    return { accessToken };
  }

  async validateUser(username: string, password: string): Promise<User | null> {
    const user = await this.userModel.findOne({ username }).exec();
    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userModel.findOne({ username }).exec();
  }

  async findAll(query: GetUsersQueryDto): Promise<{
    pageSize: number;
    pageNumber: number;
    sortBy: string;
    sortDirection: string;
    numberOfResults: number;
    list: Partial<User>[];
  }> {
    const {
      pageSize = 10,
      pageNumber = 1,
      sortBy = 'createdAt',
      sortDirection = 'desc',
    } = query;

    const skip = (pageNumber - 1) * pageSize;
    const sort: { [key: string]: SortOrder } = {
      [sortBy]: sortDirection as SortOrder,
    };

    // Validar sortBy
    if (!['username', 'createdAt', 'updatedAt'].includes(sortBy)) {
      throw new BadRequestException(
        `Campo de ordenamiento inválido: ${sortBy}`,
      );
    }

    // Obtener la lista paginada, excluyendo password
    const list = await this.userModel
      .find()
      .select('-password')
      .skip(skip)
      .limit(pageSize)
      .sort(sort)
      .exec();

    // Contar el total de documentos
    const numberOfResults = await this.userModel.countDocuments().exec();

    return {
      pageSize,
      pageNumber,
      sortBy,
      sortDirection,
      numberOfResults,
      list,
    };
  }

  async findById(id: string): Promise<Partial<User>> {
    const user = await this.userModel.findById(id).select('-password').exec();
    if (!user) {
      throw new NotFoundException(`Usuario con ID "${id}" no encontrado`);
    }
    return user;
  }
}
