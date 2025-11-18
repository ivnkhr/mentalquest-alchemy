import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Rock } from './entities/rock.entity';
import { RocksService } from './rocks.service';
import { RocksController } from './rocks.controller';
import { EdgesModule } from '../edges/edges.module';

@Module({
  imports: [TypeOrmModule.forFeature([Rock]), forwardRef(() => EdgesModule)],
  controllers: [RocksController],
  providers: [RocksService],
  exports: [RocksService],
})
export class RocksModule {}
