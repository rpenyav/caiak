import { IsString, IsEmail, IsArray, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  username: string;

  @IsString()
  password: string;

  @IsArray()
  @IsOptional()
  roles: string[];
}
