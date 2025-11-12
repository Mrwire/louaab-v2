import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pack } from '../entities/pack.entity';
import { CreatePackDto, UpdatePackDto, QueryPacksDto } from '../dto/pack.dto';

@Injectable()
export class PackService {
  constructor(
    @InjectRepository(Pack)
    private packRepository: Repository<Pack>,
  ) {}

  async create(createPackDto: CreatePackDto): Promise<Pack> {
    const pack = this.packRepository.create(createPackDto);
    return this.packRepository.save(pack);
  }

  async findAll(query: QueryPacksDto): Promise<Pack[]> {
    const { isActive, type } = query;
    const where: any = {};

    if (isActive !== undefined) {
      where.isActive = isActive;
    }
    if (type) {
      where.type = type;
    }

    return this.packRepository.find({
      where,
      relations: ['toys'],
      order: { displayOrder: 'ASC', name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Pack> {
    const pack = await this.packRepository.findOne({
      where: { id },
      relations: ['toys'],
    });
    if (!pack) {
      throw new NotFoundException(`Pack with ID "${id}" not found`);
    }
    return pack;
  }

  async update(id: string, updatePackDto: UpdatePackDto): Promise<Pack> {
    const pack = await this.findOne(id);
    this.packRepository.merge(pack, updatePackDto);
    return this.packRepository.save(pack);
  }

  async remove(id: string): Promise<void> {
    const result = await this.packRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Pack with ID "${id}" not found`);
    }
  }
}
