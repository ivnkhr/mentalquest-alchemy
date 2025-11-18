import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Register a new user
   */
  async register(registerDto: RegisterDto) {
    const user = await this.usersService.create(
      registerDto.email,
      registerDto.password,
      registerDto.username,
    );

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      username: user.username,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        created_at: user.created_at,
      },
    };
  }

  /**
   * Login user
   */
  async login(loginDto: LoginDto) {
    // Find user by email
    const user = await this.usersService.findByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Validate password
    const isPasswordValid = await this.usersService.validatePassword(
      user,
      loginDto.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      username: user.username,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        created_at: user.created_at,
      },
    };
  }

  /**
   * Get user profile
   */
  async getProfile(userId: string) {
    const user = await this.usersService.findById(userId);

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      created_at: user.created_at,
      last_sync_at: user.last_sync_at,
    };
  }
}
