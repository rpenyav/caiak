import { IsString, IsArray, IsOptional } from 'class-validator';

export class CreateWorkspaceDto {
  @IsString()
  slug: string;

  @IsString()
  name: string;

  @IsArray()
  @IsOptional()
  roles: string[];
}
