import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateGenreDto {
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Genre name must be at least 2 characters long' })
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  slug?: string;
}
