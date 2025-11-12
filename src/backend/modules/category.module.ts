import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryController } from '../controllers/category.controller';
import { CategoryService } from '../services/category.service';
import { ToyCategory } from '../entities/toy-category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ToyCategory])],
  controllers: [CategoryController],
  providers: [CategoryService],
  exports: [CategoryService],
})
export class CategoryModule {}

