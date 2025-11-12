import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { ToyCategory } from '../entities/toy-category.entity';
import { CreateCategoryDto, UpdateCategoryDto } from '../dto/category.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(ToyCategory)
    private categoryRepository: Repository<ToyCategory>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<ToyCategory> {
    const category = this.categoryRepository.create(createCategoryDto);
    
    if (createCategoryDto.parentId) {
      const parent = await this.categoryRepository.findOne({
        where: { id: createCategoryDto.parentId },
      });
      if (parent) {
        category.parent = parent;
      }
    }
    
    return await this.categoryRepository.save(category);
  }

  async findAll(): Promise<ToyCategory[]> {
    return await this.categoryRepository.find({
      where: { 
        isActive: true,
        parent: IsNull(), // Uniquement les catégories racines (sans parent)
      },
      relations: ['parent'],
      order: { displayOrder: 'ASC', name: 'ASC' },
    });
  }

  async findAllIncludingInactive(): Promise<ToyCategory[]> {
    return await this.categoryRepository.find({
      relations: ['parent'],
      order: { displayOrder: 'ASC', name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<ToyCategory> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['parent', 'children', 'toys'],
    });
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<ToyCategory> {
    const category = await this.findOne(id);
    
    if (updateCategoryDto.parentId !== undefined) {
      if (updateCategoryDto.parentId === null) {
        category.parent = null as any;
      } else {
        const parent = await this.categoryRepository.findOne({
          where: { id: updateCategoryDto.parentId },
        });
        if (parent) {
          category.parent = parent;
        }
      }
    }
    
    // Exclure parentId de l'assignation car on l'a déjà géré
    const { parentId, ...updateData } = updateCategoryDto;
    Object.assign(category, updateData);
    return await this.categoryRepository.save(category);
  }

  async remove(id: string): Promise<void> {
    const category = await this.findOne(id);
    await this.categoryRepository.remove(category);
  }

  async getToysCount(categoryId: string): Promise<number> {
    const category = await this.categoryRepository.findOne({
      where: { id: categoryId },
      relations: ['toys'],
    });
    return category?.toys?.length || 0;
  }
}

