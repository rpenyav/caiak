import {
  IsString,
  IsOptional,
  IsObject,
  IsEnum,
  IsBoolean,
} from 'class-validator';

export class CreateSettingsDto {
  @IsString()
  @IsEnum(['dark', 'light'])
  @IsOptional()
  theme?: string;

  @IsObject()
  @IsOptional()
  notifications?: { email: boolean; push: boolean };

  @IsString()
  @IsOptional()
  language?: string;
}
