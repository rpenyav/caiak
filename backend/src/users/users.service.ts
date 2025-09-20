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
    const { email, password, roles } = createUserDto;

    // Verificar si el email ya existe
    const existingUser = await this.userModel.findOne({ email }).exec();
    if (existingUser) {
      throw new BadRequestException('El email ya está registrado');
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new this.userModel({
      email,
      password: hashedPassword,
      roles: roles || [],
    });

    return newUser.save();
  }

  async login(loginUserDto: LoginUserDto): Promise<{ accessToken: string }> {
    const { email, password } = loginUserDto;

    // Buscar usuario por email
    const user = await this.userModel.findOne({ email }).exec();
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Generar token JWT
    const payload = { email: user.email, sub: user._id, roles: user.roles };
    const accessToken = this.jwtService.sign(payload);

    return { accessToken };
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
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
    if (!['email', 'createdAt', 'updatedAt'].includes(sortBy)) {
      throw new BadRequestException(
        `Campo de ordenamiento inválido: ${sortBy}`,
      );
    }

    // Obtener la lista paginada, excluyendo password
    const list = await this.userModel
      .find()
      .select('-password') // Excluir el campo password
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
