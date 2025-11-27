import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { FAQ } from '../entities/faq.entity';
import { CreateFAQDto, UpdateFAQDto, QueryFAQsDto } from '../dto/faq.dto';

@Injectable()
export class FAQService {
  constructor(
    @InjectRepository(FAQ)
    private faqRepository: Repository<FAQ>,
  ) {}

  async create(createFAQDto: CreateFAQDto): Promise<FAQ> {
    const faq = this.faqRepository.create(createFAQDto);
    return this.faqRepository.save(faq);
  }

  async findAll(query: QueryFAQsDto): Promise<FAQ[]> {
    const { isActive, category, search } = query;
    const where: any = {};

    if (isActive !== undefined) {
      where.isActive = isActive;
    }
    if (category) {
      where.category = category;
    }
    if (search) {
      where.question = Like(`%${search}%`);
    }

    return this.faqRepository.find({
      where,
      order: { displayOrder: 'ASC', category: 'ASC' },
    });
  }

  async findOne(id: string): Promise<FAQ> {
    const faq = await this.faqRepository.findOne({ where: { id } });
    if (!faq) {
      throw new NotFoundException(`FAQ with ID "${id}" not found`);
    }
    return faq;
  }

  async update(id: string, updateFAQDto: UpdateFAQDto): Promise<FAQ> {
    const faq = await this.findOne(id);
    this.faqRepository.merge(faq, updateFAQDto);
    return this.faqRepository.save(faq);
  }

  async remove(id: string): Promise<void> {
    const result = await this.faqRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`FAQ with ID "${id}" not found`);
    }
  }
}
