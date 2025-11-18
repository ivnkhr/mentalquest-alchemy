import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateEdgeDto } from './create-edge.dto';

export class UpdateEdgeDto extends PartialType(CreateEdgeDto) {
  @IsOptional()
  @IsBoolean()
  is_completed?: boolean;
}
