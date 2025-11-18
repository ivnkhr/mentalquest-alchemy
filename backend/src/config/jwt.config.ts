import { JwtModuleOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

export const getJwtConfig = (
  configService: ConfigService,
): JwtModuleOptions => {
  return {
    secret: configService.get<string>('JWT_SECRET') || 'default-secret-key',
    signOptions: {
      expiresIn: (configService.get<string>('JWT_EXPIRES_IN') || '7d') as any,
    },
  };
};
