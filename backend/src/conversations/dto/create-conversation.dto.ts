import { IsString, IsArray, IsOptional } from 'class-validator';

export class CreateConversationDto {
  @IsString()
  name: string;

  @IsArray()
  @IsOptional()
  roles: string[];

  @IsString()
  workspaceSlug: string;
}
