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
} from '@nestjs/common';
import { EdgesService } from './edges.service';
import { CreateEdgeDto } from './dto/create-edge.dto';
import { UpdateEdgeDto } from './dto/update-edge.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller()
@UseGuards(JwtAuthGuard)
export class EdgesController {
  constructor(private readonly edgesService: EdgesService) {}

  @Post('rocks/:rockId/edges')
  create(
    @Param('rockId') rockId: string,
    @Request() req,
    @Body() createEdgeDto: CreateEdgeDto,
  ) {
    return this.edgesService.create(rockId, req.user.id, createEdgeDto);
  }

  @Get('rocks/:rockId/edges')
  findByRock(@Param('rockId') rockId: string, @Request() req) {
    return this.edgesService.findByRock(rockId, req.user.id);
  }

  @Patch('edges/:id')
  update(
    @Param('id') id: string,
    @Request() req,
    @Body() updateEdgeDto: UpdateEdgeDto,
  ) {
    return this.edgesService.update(id, req.user.id, updateEdgeDto);
  }

  @Delete('edges/:id')
  async remove(@Param('id') id: string, @Request() req) {
    await this.edgesService.remove(id, req.user.id);
    return { message: 'Edge deleted successfully' };
  }
}
