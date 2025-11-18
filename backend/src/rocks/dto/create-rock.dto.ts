import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';

export class CreateRockDto {
  @IsString()
  @MinLength(1, { message: 'Title must not be empty' })
  @MaxLength(255, { message: 'Title must not exceed 255 characters' })
  title: string;

  @IsOptional()
  @IsString()
  description?: string;
}
