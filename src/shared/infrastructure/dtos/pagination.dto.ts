import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Length, Max, Min } from 'class-validator';

export class PaginationDto {
  @Type(() => String)
  @Length(3, 20)
  @IsString()
  readonly search!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  readonly page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(15)
  readonly limit?: number = 15;
}

export class PaginatedResponseDto<T> {
  data!: T[];

  page!: number;

  limit!: number;

  total!: number;

  hasNextPage!: boolean;
}
