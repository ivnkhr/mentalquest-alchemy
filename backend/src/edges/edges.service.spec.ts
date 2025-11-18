import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { EdgesService } from './edges.service';
import { Edge } from './entities/edge.entity';
import { RocksService } from '../rocks/rocks.service';

describe('EdgesService', () => {
  let service: EdgesService;
  let repository: Repository<Edge>;
  let rocksService: RocksService;

  const mockUserId = 'user-123';
  const mockRockId = 'rock-123';
  const mockEdge: Edge = {
    id: 'edge-123',
    rock_id: mockRockId,
    title: 'Test Edge',
    description: 'Test Description',
    is_completed: false,
    order_index: 0,
    version_vector: null,
    created_at: new Date(),
    updated_at: new Date(),
    completed_at: null,
    is_deleted: false,
    deleted_at: null,
    rock: {
      id: mockRockId,
      user_id: mockUserId,
    } as any,
    generateId: jest.fn(),
  };

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
  };

  const mockRocksService = {
    findOne: jest.fn(),
    updateProgress: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EdgesService,
        {
          provide: getRepositoryToken(Edge),
          useValue: mockRepository,
        },
        {
          provide: RocksService,
          useValue: mockRocksService,
        },
      ],
    }).compile();

    service = module.get<EdgesService>(EdgesService);
    repository = module.get<Repository<Edge>>(getRepositoryToken(Edge));
    rocksService = module.get<RocksService>(RocksService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new edge', async () => {
      const createEdgeDto = {
        title: 'New Edge',
        description: 'New Description',
      };

      mockRocksService.findOne.mockResolvedValue({ id: mockRockId });
      mockRepository.create.mockReturnValue(mockEdge);
      mockRepository.save.mockResolvedValue(mockEdge);
      mockRocksService.updateProgress.mockResolvedValue(undefined);

      const result = await service.create(mockRockId, mockUserId, createEdgeDto);

      expect(mockRocksService.findOne).toHaveBeenCalledWith(
        mockRockId,
        mockUserId,
      );
      expect(mockRepository.create).toHaveBeenCalledWith({
        ...createEdgeDto,
        rock_id: mockRockId,
      });
      expect(mockRocksService.updateProgress).toHaveBeenCalledWith(mockRockId);
      expect(result).toEqual(mockEdge);
    });
  });

  describe('findByRock', () => {
    it('should return all edges for a rock', async () => {
      mockRocksService.findOne.mockResolvedValue({ id: mockRockId });
      mockRepository.find.mockResolvedValue([mockEdge]);

      const result = await service.findByRock(mockRockId, mockUserId);

      expect(mockRocksService.findOne).toHaveBeenCalledWith(
        mockRockId,
        mockUserId,
      );
      expect(result).toEqual([mockEdge]);
    });
  });

  describe('findOne', () => {
    it('should return an edge if found and owned by user', async () => {
      mockRepository.findOne.mockResolvedValue(mockEdge);

      const result = await service.findOne(mockEdge.id, mockUserId);

      expect(result).toEqual(mockEdge);
    });

    it('should throw NotFoundException if edge not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.findOne('nonexistent', mockUserId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user does not own edge', async () => {
      const otherUserEdge = {
        ...mockEdge,
        rock: { user_id: 'other-user' },
      };
      mockRepository.findOne.mockResolvedValue(otherUserEdge);

      await expect(service.findOne(mockEdge.id, mockUserId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('update', () => {
    it('should update an edge', async () => {
      const updateDto = { title: 'Updated Title' };
      mockRepository.findOne.mockResolvedValue(mockEdge);
      mockRepository.save.mockResolvedValue({ ...mockEdge, ...updateDto });
      mockRocksService.updateProgress.mockResolvedValue(undefined);

      const result = await service.update(mockEdge.id, mockUserId, updateDto);

      expect(result.title).toBe(updateDto.title);
      expect(mockRocksService.updateProgress).toHaveBeenCalledWith(mockRockId);
    });

    it('should set completed_at when is_completed changes to true', async () => {
      mockRepository.findOne.mockResolvedValue(mockEdge);
      mockRepository.save.mockResolvedValue(mockEdge);
      mockRocksService.updateProgress.mockResolvedValue(undefined);

      await service.update(mockEdge.id, mockUserId, { is_completed: true });

      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          is_completed: true,
          completed_at: expect.any(Date),
        }),
      );
    });
  });

  describe('remove', () => {
    it('should soft delete an edge', async () => {
      mockRepository.findOne.mockResolvedValue(mockEdge);
      mockRepository.save.mockResolvedValue(mockEdge);
      mockRocksService.updateProgress.mockResolvedValue(undefined);

      await service.remove(mockEdge.id, mockUserId);

      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          is_deleted: true,
          deleted_at: expect.any(Date),
        }),
      );
      expect(mockRocksService.updateProgress).toHaveBeenCalledWith(mockRockId);
    });
  });
});
