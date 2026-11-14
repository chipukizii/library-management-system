import {
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateBookDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  author?: string;

  @IsString()
  @IsOptional()
  isbn?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  coverImage?: string;

  @IsInt()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  totalCopies?: number;

  @IsInt()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  availableCopies?: number;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  genreId?: number;
}
