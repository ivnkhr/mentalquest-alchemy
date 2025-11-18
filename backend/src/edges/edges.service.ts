import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Edge } from './entities/edge.entity';
import { CreateEdgeDto } from './dto/create-edge.dto';
import { UpdateEdgeDto } from './dto/update-edge.dto';
import { RocksService } from '../rocks/rocks.service';

@Injectable()
export class EdgesService {
  constructor(
    @InjectRepository(Edge)
    private readonly edgesRepository: Repository<Edge>,
    @Inject(forwardRef(() => RocksService))
    private readonly rocksService: RocksService,
  ) {}

  /**
   * Create a new edge with rock ownership verification
   */
  async create(
    rockId: string,
    userId: string,
    createEdgeDto: CreateEdgeDto,
  ): Promise<Edge> {
    // Verify user owns the rock
    await this.rocksService.findOne(rockId, userId);

    const edge = this.edgesRepository.create({
      ...createEdgeDto,
      rock_id: rockId,
    });

    const savedEdge = await this.edgesRepository.save(edge);

    // Update rock progress after adding edge
    await this.rocksService.updateProgress(rockId);

    return savedEdge;
  }

  /**
   * Find all edges for a rock with ownership verification
   */
  async findByRock(rockId: string, userId: string): Promise<Edge[]> {
    // Verify user owns the rock
    await this.rocksService.findOne(rockId, userId);

    return await this.edgesRepository.find({
      where: { rock_id: rockId, is_deleted: false },
      order: { order_index: 'ASC', created_at: 'ASC' },
    });
  }

  /**
   * Find a single edge with ownership verification
   */
  async findOne(id: string, userId: string): Promise<Edge> {
    const edge = await this.edgesRepository.findOne({
      where: { id, is_deleted: false },
      relations: ['rock'],
    });

    if (!edge) {
      throw new NotFoundException('Edge not found');
    }

    // Verify user owns the parent rock
    if (edge.rock.user_id !== userId) {
      throw new ForbiddenException('You do not have access to this edge');
    }

    return edge;
  }

  /**
   * Update an edge with ownership verification
   */
  async update(
    id: string,
    userId: string,
    updateEdgeDto: UpdateEdgeDto,
  ): Promise<Edge> {
    const edge = await this.findOne(id, userId);

    // Update fields
    Object.assign(edge, updateEdgeDto);

    // Set completed_at if is_completed changed to true
    if (updateEdgeDto.is_completed === true && !edge.completed_at) {
      edge.completed_at = new Date();
    }

    // Clear completed_at if is_completed changed to false (set to null for DB)
    if (updateEdgeDto.is_completed === false && edge.completed_at) {
      (edge as any).completed_at = null;
    }

    const updatedEdge = await this.edgesRepository.save(edge);

    // Update rock progress after edge update
    await this.rocksService.updateProgress(edge.rock_id);

    return updatedEdge;
  }

  /**
   * Soft delete an edge
   */
  async remove(id: string, userId: string): Promise<void> {
    const edge = await this.findOne(id, userId);

    edge.is_deleted = true;
    edge.deleted_at = new Date();

    await this.edgesRepository.save(edge);

    // Update rock progress after edge deletion
    await this.rocksService.updateProgress(edge.rock_id);
  }
}
