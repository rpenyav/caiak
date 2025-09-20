import { IsInt, Min, IsOptional, IsString, IsIn } from 'class-validator';
import { Transform, TransformFnParams } from 'class-transformer';

export class GetWorkspacesQueryDto {
  @IsInt()
  @Min(1)
  @IsOptional()
  @Transform(({ value }: TransformFnParams) =>
    value ? parseInt(value as string, 10) : 10,
  )
  pageSize: number = 10;

  @IsInt()
  @Min(1)
  @IsOptional()
  @Transform(({ value }: TransformFnParams) =>
    value ? parseInt(value as string, 10) : 1,
  )
  pageNumber: number = 1;

  @IsString()
  @IsOptional()
  @IsIn(['slug', 'name', 'createdAt', 'updatedAt'])
  @Transform(({ value }: TransformFnParams) => value || 'createdAt')
  sortBy: string = 'createdAt';

  @IsString()
  @IsOptional()
  @IsIn(['asc', 'desc'])
  @Transform(({ value }: TransformFnParams) => value || 'desc')
  sortDirection: string = 'desc';
}
