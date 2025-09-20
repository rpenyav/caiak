import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';

export class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  conversationId: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsString()
  @IsOptional()
  userId?: string;

  @IsString()
  @IsOptional()
  workspaceSlug?: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  fileUrls?: string[]; // Array de URLs de archivos
}
