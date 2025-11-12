import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SyncController } from '../controllers/sync.controller';
import { SyncService } from '../services/sync.service';
import { Toy } from '../entities/toy.entity';
import { ToyCategory } from '../entities/toy-category.entity';
import { ToyImage } from '../entities/toy-image.entity';
import { AgeRange } from '../entities/age-range.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Toy, ToyCategory, ToyImage, AgeRange])],
  controllers: [SyncController],
  providers: [SyncService],
  exports: [SyncService],
})
export class SyncModule {}

