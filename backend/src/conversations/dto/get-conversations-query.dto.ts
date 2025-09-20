import { IsOptional, IsInt, Min, IsString, IsIn } from 'class-validator';

export class GetConversationsQueryDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  pageSize?: number = 10;

  @IsOptional()
  @IsInt()
  @Min(1)
  pageNumber?: number = 1;

  @IsOptional()
  @IsString()
  @IsIn(['name', 'createdAt', 'updatedAt'])
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  sortDirection?: string = 'desc';
}
