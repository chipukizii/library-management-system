import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateGenreDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'Genre name must be at least 2 characters long' })
  name: string;

  @IsOptional()
  @IsString()
  slug?: string;
}
