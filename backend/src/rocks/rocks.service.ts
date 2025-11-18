import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rock, RockStatus } from './entities/rock.entity';
import { CreateRockDto } from './dto/create-rock.dto';
import { UpdateRockDto } from './dto/update-rock.dto';

@Injectable()
export class RocksService {
  constructor(
    @InjectRepository(Rock)
    private readonly rocksRepository: Repository<Rock>,
  ) {}

  /**
   * Create a new rock
   */
  async create(userId: string, createRockDto: CreateRockDto): Promise<Rock> {
    const rock = this.rocksRepository.create({
      ...createRockDto,
      user_id: userId,
    });

    return await this.rocksRepository.save(rock);
  }

  /**
   * Find all rocks for a user, optionally filtered by status
   */
  async findAll(userId: string, status?: RockStatus): Promise<Rock[]> {
    const query = this.rocksRepository
      .createQueryBuilder('rock')
      .where('rock.user_id = :userId', { userId })
      .andWhere('rock.is_deleted = :isDeleted', { isDeleted: false });

    if (status) {
      query.andWhere('rock.status = :status', { status });
    }

    query.orderBy('rock.updated_at', 'DESC');

    return await query.getMany();
  }

  /**
   * Find a single rock by ID with ownership check
   */
  async findOne(id: string, userId: string): Promise<Rock> {
    const rock = await this.rocksRepository.findOne({
      where: { id, is_deleted: false },
      relations: ['edges'],
    });

    if (!rock) {
      throw new NotFoundException('Rock not found');
    }

    if (rock.user_id !== userId) {
      throw new ForbiddenException('You do not have access to this rock');
    }

    return rock;
  }

  /**
   * Update a rock with ownership check
   */
  async update(
    id: string,
    userId: string,
    updateRockDto: UpdateRockDto,
  ): Promise<Rock> {
    const rock = await this.findOne(id, userId);

    // Update fields
    Object.assign(rock, updateRockDto);

    // Set completed_at if status changed to gem
    if (updateRockDto.status === RockStatus.GEM && !rock.completed_at) {
      rock.completed_at = new Date();
    }

    // Set archived_at if status changed to archived
    if (updateRockDto.status === RockStatus.ARCHIVED && !rock.archived_at) {
      rock.archived_at = new Date();
    }

    return await this.rocksRepository.save(rock);
  }

  /**
   * Soft delete a rock
   */
  async remove(id: string, userId: string): Promise<void> {
    const rock = await this.findOne(id, userId);

    rock.is_deleted = true;
    rock.deleted_at = new Date();

    await this.rocksRepository.save(rock);
  }

  /**
   * Calculate progress based on completed edges
   */
  async calculateProgress(rockId: string): Promise<number> {
    const rock = await this.rocksRepository.findOne({
      where: { id: rockId },
      relations: ['edges'],
    });

    if (!rock || !rock.edges || rock.edges.length === 0) {
      return 0;
    }

    const completedEdges = rock.edges.filter(
      (edge) => edge.is_completed && !edge.is_deleted,
    ).length;
    const totalEdges = rock.edges.filter((edge) => !edge.is_deleted).length;

    if (totalEdges === 0) {
      return 0;
    }

    return Math.round((completedEdges / totalEdges) * 100);
  }

  /**
   * Update rock progress
   */
  async updateProgress(rockId: string): Promise<void> {
    const progress = await this.calculateProgress(rockId);

    await this.rocksRepository.update({ id: rockId }, { progress });
  }
}
