import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBookDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  author: string;

  @IsString()
  @IsNotEmpty()
  isbn: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  coverImage?: string;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  totalCopies: number;

  @IsInt()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  availableCopies?: number;

  @IsInt()
  @Type(() => Number)
  genreId: number;
}
