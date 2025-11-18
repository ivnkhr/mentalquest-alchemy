import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { RocksService } from './rocks.service';
import { CreateRockDto } from './dto/create-rock.dto';
import { UpdateRockDto } from './dto/update-rock.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RockStatus } from './entities/rock.entity';

@Controller('rocks')
@UseGuards(JwtAuthGuard)
export class RocksController {
  constructor(private readonly rocksService: RocksService) {}

  @Post()
  create(@Request() req, @Body() createRockDto: CreateRockDto) {
    return this.rocksService.create(req.user.id, createRockDto);
  }

  @Get()
  findAll(@Request() req, @Query('status') status?: RockStatus) {
    return this.rocksService.findAll(req.user.id, status);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.rocksService.findOne(id, req.user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Request() req,
    @Body() updateRockDto: UpdateRockDto,
  ) {
    return this.rocksService.update(id, req.user.id, updateRockDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    await this.rocksService.remove(id, req.user.id);
    return { message: 'Rock deleted successfully' };
  }
}
