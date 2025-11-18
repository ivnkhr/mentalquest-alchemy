import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { RocksService } from './rocks.service';
import { Rock, RockStatus } from './entities/rock.entity';

describe('RocksService', () => {
  let service: RocksService;
  let repository: Repository<Rock>;

  const mockUserId = 'user-123';
  const mockRock: Rock = {
    id: 'rock-123',
    user_id: mockUserId,
    title: 'Test Rock',
    description: 'Test Description',
    status: RockStatus.ACTIVE,
    progress: 0,
    version_vector: null,
    created_at: new Date(),
    updated_at: new Date(),
    completed_at: null,
    archived_at: null,
    is_deleted: false,
    deleted_at: null,
    user: null,
    edges: [],
    generateId: jest.fn(),
  };

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RocksService,
        {
          provide: getRepositoryToken(Rock),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<RocksService>(RocksService);
    repository = module.get<Repository<Rock>>(getRepositoryToken(Rock));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new rock', async () => {
      const createRockDto = {
        title: 'New Rock',
        description: 'New Description',
      };

      mockRepository.create.mockReturnValue(mockRock);
      mockRepository.save.mockResolvedValue(mockRock);

      const result = await service.create(mockUserId, createRockDto);

      expect(mockRepository.create).toHaveBeenCalledWith({
        ...createRockDto,
        user_id: mockUserId,
      });
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockRock);
    });
  });

  describe('findAll', () => {
    it('should return all rocks for a user', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockRock]),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.findAll(mockUserId);

      expect(result).toEqual([mockRock]);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'rock.user_id = :userId',
        { userId: mockUserId },
      );
    });

    it('should filter by status', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockRock]),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await service.findAll(mockUserId, RockStatus.ACTIVE);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'rock.status = :status',
        { status: RockStatus.ACTIVE },
      );
    });
  });

  describe('findOne', () => {
    it('should return a rock if found and owned by user', async () => {
      mockRepository.findOne.mockResolvedValue(mockRock);

      const result = await service.findOne(mockRock.id, mockUserId);

      expect(result).toEqual(mockRock);
    });

    it('should throw NotFoundException if rock not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.findOne('nonexistent', mockUserId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user does not own rock', async () => {
      const otherUserRock = { ...mockRock, user_id: 'other-user' };
      mockRepository.findOne.mockResolvedValue(otherUserRock);

      await expect(service.findOne(mockRock.id, mockUserId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('update', () => {
    it('should update a rock', async () => {
      const updateDto = { title: 'Updated Title' };
      mockRepository.findOne.mockResolvedValue(mockRock);
      mockRepository.save.mockResolvedValue({ ...mockRock, ...updateDto });

      const result = await service.update(mockRock.id, mockUserId, updateDto);

      expect(result.title).toBe(updateDto.title);
    });

    it('should set completed_at when status changes to gem', async () => {
      mockRepository.findOne.mockResolvedValue(mockRock);
      mockRepository.save.mockResolvedValue(mockRock);

      await service.update(mockRock.id, mockUserId, {
        status: RockStatus.GEM,
      });

      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          status: RockStatus.GEM,
          completed_at: expect.any(Date),
        }),
      );
    });
  });

  describe('remove', () => {
    it('should soft delete a rock', async () => {
      mockRepository.findOne.mockResolvedValue(mockRock);
      mockRepository.save.mockResolvedValue(mockRock);

      await service.remove(mockRock.id, mockUserId);

      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          is_deleted: true,
          deleted_at: expect.any(Date),
        }),
      );
    });
  });

  describe('calculateProgress', () => {
    it('should return 0 if no edges', async () => {
      mockRepository.findOne.mockResolvedValue({ ...mockRock, edges: [] });

      const result = await service.calculateProgress(mockRock.id);

      expect(result).toBe(0);
    });

    it('should calculate progress correctly', async () => {
      const rockWithEdges = {
        ...mockRock,
        edges: [
          { is_completed: true, is_deleted: false },
          { is_completed: false, is_deleted: false },
          { is_completed: true, is_deleted: false },
        ],
      };
      mockRepository.findOne.mockResolvedValue(rockWithEdges);

      const result = await service.calculateProgress(mockRock.id);

      expect(result).toBe(67); // 2/3 = 66.67 rounded to 67
    });
  });
});
