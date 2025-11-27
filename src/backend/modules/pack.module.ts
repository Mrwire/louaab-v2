import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PackController } from '../controllers/pack.controller';
import { PackService } from '../services/pack.service';
import { Pack } from '../entities/pack.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Pack]),
  ],
  controllers: [PackController],
  providers: [PackService],
  exports: [PackService],
})
export class PackModule {}
