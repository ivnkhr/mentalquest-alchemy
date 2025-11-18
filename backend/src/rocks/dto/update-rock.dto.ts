import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsNumber, Min, Max, IsOptional } from 'class-validator';
import { CreateRockDto } from './create-rock.dto';
import { RockStatus } from '../entities/rock.entity';

export class UpdateRockDto extends PartialType(CreateRockDto) {
  @IsOptional()
  @IsEnum(RockStatus)
  status?: RockStatus;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  progress?: number;
}
