import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;

  const mockUser: User = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    username: 'testuser',
    password_hash: 'hashedpassword',
    created_at: new Date(),
    updated_at: new Date(),
    last_sync_at: null,
    generateId: jest.fn(),
  };

  const mockRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new user with hashed password', async () => {
      const email = 'newuser@example.com';
      const password = 'Password123';
      const username = 'newuser';

      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(mockUser);
      mockRepository.save.mockResolvedValue(mockUser);

      const result = await service.create(email, password, username);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: [{ email }, { username }],
      });
      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });

    it('should throw ConflictException if email already exists', async () => {
      const email = 'test@example.com'; // Same as mockUser.email
      const password = 'Password123';
      const username = 'newuser';

      mockRepository.findOne.mockResolvedValue(mockUser);

      await expect(service.create(email, password, username)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw ConflictException if username already exists', async () => {
      const email = 'newuser@example.com';
      const password = 'Password123';
      const username = 'testuser';

      mockRepository.findOne.mockResolvedValue({ ...mockUser, email: 'other@example.com' });

      await expect(service.create(email, password, username)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findByEmail', () => {
    it('should return user if found', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByEmail('test@example.com');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should return user if found', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findById(mockUser.id);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findById('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('validatePassword', () => {
    it('should return true for valid password', async () => {
      const password = 'Password123';
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = { ...mockUser, password_hash: hashedPassword };

      const result = await service.validatePassword(user, password);

      expect(result).toBe(true);
    });

    it('should return false for invalid password', async () => {
      const password = 'Password123';
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = { ...mockUser, password_hash: hashedPassword };

      const result = await service.validatePassword(user, 'WrongPassword');

      expect(result).toBe(false);
    });
  });

  describe('updateLastSync', () => {
    it('should update last_sync_at timestamp', async () => {
      mockRepository.update.mockResolvedValue({ affected: 1 });

      await service.updateLastSync(mockUser.id);

      expect(mockRepository.update).toHaveBeenCalledWith(
        { id: mockUser.id },
        { last_sync_at: expect.any(Date) },
      );
    });
  });
});
