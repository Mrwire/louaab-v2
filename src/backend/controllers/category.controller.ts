import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { CategoryService } from '../services/category.service';
import { CreateCategoryDto, UpdateCategoryDto } from '../dto/category.dto';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    return {
      success: true,
      data: await this.categoryService.create(createCategoryDto),
      message: 'Catégorie créée avec succès',
    };
  }

  @Get()
  async findAll() {
    return {
      success: true,
      data: await this.categoryService.findAll(),
    };
  }

  @Get('all')
  async findAllIncludingInactive() {
    return {
      success: true,
      data: await this.categoryService.findAllIncludingInactive(),
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return {
      success: true,
      data: await this.categoryService.findOne(id),
    };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    return {
      success: true,
      data: await this.categoryService.update(id, updateCategoryDto),
      message: 'Catégorie mise à jour avec succès',
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.categoryService.remove(id);
    return {
      success: true,
      message: 'Catégorie supprimée avec succès',
    };
  }

  @Get(':id/toys-count')
  async getToysCount(@Param('id') id: string) {
    return {
      success: true,
      data: {
        count: await this.categoryService.getToysCount(id),
      },
    };
  }
}

