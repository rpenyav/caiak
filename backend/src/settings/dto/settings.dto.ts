import {
  IsString,
  IsOptional,
  IsObject,
  IsEnum,
  IsBoolean,
} from 'class-validator';

export class SettingsDto {
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
