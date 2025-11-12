import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ToyController } from '../controllers/toy.controller';
import { ToyService } from '../services/toy.service';
import { Toy } from '../entities/toy.entity';
import { ToyCategory } from '../entities/toy-category.entity';
import { ToyImage } from '../entities/toy-image.entity';
import { CleaningLog } from '../entities/cleaning-log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Toy, ToyCategory, ToyImage, CleaningLog]),
  ],
  controllers: [ToyController],
  providers: [ToyService],
  exports: [ToyService],
})
export class ToyModule {}


