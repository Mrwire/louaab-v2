import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AgeRange } from '../entities/age-range.entity';
import { CreateAgeRangeDto, UpdateAgeRangeDto } from '../dto/age-range.dto';

@Injectable()
export class AgeRangeService {
  constructor(
    @InjectRepository(AgeRange)
    private ageRangeRepository: Repository<AgeRange>,
  ) {}

  async create(createAgeRangeDto: CreateAgeRangeDto): Promise<AgeRange> {
    const ageRange = this.ageRangeRepository.create(createAgeRangeDto);
    return await this.ageRangeRepository.save(ageRange);
  }

  async findAll(): Promise<AgeRange[]> {
    return await this.ageRangeRepository.find({
      where: { isActive: true },
      order: { displayOrder: 'ASC', label: 'ASC' },
    });
  }

  async findAllIncludingInactive(): Promise<AgeRange[]> {
    return await this.ageRangeRepository.find({
      order: { displayOrder: 'ASC', label: 'ASC' },
    });
  }

  async findOne(id: string): Promise<AgeRange> {
    const ageRange = await this.ageRangeRepository.findOne({ where: { id } });
    if (!ageRange) {
      throw new NotFoundException(`Age range with ID ${id} not found`);
    }
    return ageRange;
  }

  async update(id: string, updateAgeRangeDto: UpdateAgeRangeDto): Promise<AgeRange> {
    const ageRange = await this.findOne(id);
    Object.assign(ageRange, updateAgeRangeDto);
    return await this.ageRangeRepository.save(ageRange);
  }

  async remove(id: string): Promise<void> {
    const ageRange = await this.findOne(id);
    await this.ageRangeRepository.remove(ageRange);
  }

  async getToysCount(ageRangeId: string): Promise<number> {
    // Cette méthode devrait compter les jouets correspondant à cette tranche d'âge
    // Pour l'instant, retournons 0 - à implémenter avec une relation avec Toy
    return 0;
  }
}

