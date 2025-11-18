import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Edge } from './entities/edge.entity';
import { EdgesService } from './edges.service';
import { EdgesController } from './edges.controller';
import { RocksModule } from '../rocks/rocks.module';

@Module({
  imports: [TypeOrmModule.forFeature([Edge]), forwardRef(() => RocksModule)],
  controllers: [EdgesController],
  providers: [EdgesService],
  exports: [EdgesService],
})
export class EdgesModule {}
