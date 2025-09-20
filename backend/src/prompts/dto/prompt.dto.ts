import { IsString, IsNotEmpty } from 'class-validator';

export class PromptDto {
  @IsString()
  @IsNotEmpty()
  appId: string;

  @IsString()
  @IsNotEmpty()
  prompt: string;
}
