import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between, In } from 'typeorm';
import { Toy, ToyStatus } from '../entities/toy.entity';
import { ToyCategory } from '../entities/toy-category.entity';
import { ToyImage } from '../entities/toy-image.entity';
import { CreateToyDto, UpdateToyDto, QueryToysDto } from '../dto/create-toy.dto';

const slugify = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

@Injectable()
export class ToyService {
  constructor(
    @InjectRepository(Toy)
    private toyRepository: Repository<Toy>,
    @InjectRepository(ToyCategory)
    private categoryRepository: Repository<ToyCategory>,
    @InjectRepository(ToyImage)
    private imageRepository: Repository<ToyImage>,
  ) {}

  private async generateUniqueSlug(baseValue: string, excludeId?: string) {
    let base = slugify(baseValue);
    if (!base) {
      base = `toy-${Date.now()}`;
    }
    let slugCandidate = base;
    let counter = 1;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const existing = await this.toyRepository.findOne({
        where: { slug: slugCandidate },
      });
      if (!existing || existing.id === excludeId) {
        return slugCandidate;
      }
      slugCandidate = `${base}-${counter++}`;
    }
  }

  async create(createToyDto: CreateToyDto): Promise<Toy> {
    const { categoryIds, images, ...toyData } = createToyDto;

    if (!toyData.slug && toyData.name) {
      toyData.slug = await this.generateUniqueSlug(toyData.name);
    } else if (toyData.slug) {
      toyData.slug = await this.generateUniqueSlug(toyData.slug);
    }

    // Create toy
    const toy = this.toyRepository.create(toyData);
    
    // Handle categories
    if (categoryIds && categoryIds.length > 0) {
      const categories = await this.categoryRepository.findBy({
        id: In(categoryIds),
      });
      toy.categories = categories;
    }

    // Save toy (handle unique conflicts gracefully)
    let savedToy: Toy;
    try {
      savedToy = await this.toyRepository.save(toy);
    } catch (error: any) {
      if (error?.code === '23505') {
        const field =
          typeof error?.detail === 'string' && error.detail.includes('(slug)')
            ? 'slug'
            : typeof error?.detail === 'string' && error.detail.includes('(sku)')
              ? 'sku'
              : 'champ unique';
        throw new ConflictException(`Un ${field} identique existe déjà. Merci de changer le ${field}.`);
      }
      throw error;
    }

    // Handle images
    if (images && images.length > 0) {
      const toyImages = images.map((img, index) =>
        this.imageRepository.create({
          toy: savedToy,
          url: img.url,
          altText: img.altText,
          isPrimary: img.isPrimary || index === 0,
          displayOrder: index,
        }),
      );
      await this.imageRepository.save(toyImages);
    }

    return this.findOne(savedToy.id);
  }

  async findAll(query: QueryToysDto) {
    const {
      search,
      status,
      ageMin,
      ageMax,
      categoryId,
      genderTarget,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = query;

    const queryBuilder = this.toyRepository
      .createQueryBuilder('toy')
      .leftJoinAndSelect('toy.categories', 'category')
      .leftJoinAndSelect('toy.images', 'image')
      .where('toy.isActive = :isActive', { isActive: true });

    // Search
    if (search) {
      queryBuilder.andWhere(
        '(toy.name ILIKE :search OR toy.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Status filter
    if (status) {
      queryBuilder.andWhere('toy.status = :status', { status });
    }

    // Age filter
    if (ageMin !== undefined) {
      queryBuilder.andWhere('toy.ageMin >= :ageMin', { ageMin });
    }
    if (ageMax !== undefined) {
      queryBuilder.andWhere('toy.ageMax <= :ageMax', { ageMax });
    }

    // Category filter
    if (categoryId) {
      queryBuilder.andWhere('category.id = :categoryId', { categoryId });
    }

    // Gender filter
    if (genderTarget) {
      queryBuilder.andWhere(
        '(toy.genderTarget = :genderTarget OR toy.genderTarget = :unisex)',
        { genderTarget, unisex: 'unisex' },
      );
    }

    // Sorting
    queryBuilder.orderBy(`toy.${sortBy}`, sortOrder);

    // Pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [items, total] = await queryBuilder.getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Toy> {
    const toy = await this.toyRepository.findOne({
      where: { id },
      relations: ['categories', 'images', 'cleaningLogs'],
    });

    if (!toy) {
      throw new NotFoundException(`Toy with ID ${id} not found`);
    }

    return toy;
  }

  async update(id: string, updateToyDto: UpdateToyDto): Promise<Toy> {
    const toy = await this.findOne(id);
    const { categoryIds, images, ...toyData } = updateToyDto;

    // Update toy data
    Object.assign(toy, toyData);

    // Keep availability in sync with stock updates
    if (toyData.stockQuantity !== undefined) {
      const newStock = Number(toyData.stockQuantity) || 0;
      const currentStock = Number(toy.stockQuantity || 0);
      const currentAvailable = Number(toy.availableQuantity || 0);
      const stockDelta = newStock - currentStock;

      toy.stockQuantity = newStock;

      if (stockDelta > 0) {
        // Increase available stock by the delta, capped to the new stock level
        toy.availableQuantity = Math.min(newStock, currentAvailable + stockDelta);
      } else if (stockDelta < 0) {
        // If stock is reduced, clamp available to the new stock level
        toy.availableQuantity = Math.min(newStock, currentAvailable);
      } else {
        // No stock change, ensure available is not greater than stock
        toy.availableQuantity = Math.min(newStock, currentAvailable);
      }

      toy.availableQuantity = Math.max(0, toy.availableQuantity);

      if (updateToyDto.status === undefined) {
        toy.status = newStock > 0 ? ToyStatus.AVAILABLE : ToyStatus.MAINTENANCE;
      }
    }

    // If availableQuantity is explicitly provided, honor it but cap to stock
    if (toyData.availableQuantity !== undefined) {
      const provided = Number(toyData.availableQuantity) || 0;
      const cap = Number(toy.stockQuantity || toyData.stockQuantity || 0);
      toy.availableQuantity = cap ? Math.min(provided, cap) : provided;
      toy.availableQuantity = Math.max(0, toy.availableQuantity);
    }

    if (toyData.slug) {
      toy.slug = await this.generateUniqueSlug(toyData.slug, toy.id);
    } else if (!toy.slug && toy.name) {
      toy.slug = await this.generateUniqueSlug(toy.name, toy.id);
    }

    // Update categories if provided
    if (categoryIds) {
      const categories = await this.categoryRepository.findBy({
        id: In(categoryIds),
      });
      toy.categories = categories;
    }

    // Save updates
    await this.toyRepository.save(toy);

    // Update images if provided
    if (images) {
      // Remove old images
      await this.imageRepository.delete({ toy: { id } });
      
      // Add new images
      const toyImages = images.map((img, index) =>
        this.imageRepository.create({
          toy,
          url: img.url,
          altText: img.altText,
          isPrimary: img.isPrimary || index === 0,
          displayOrder: index,
        }),
      );
      await this.imageRepository.save(toyImages);
    }

    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const toy = await this.findOne(id);
    await this.toyRepository.remove(toy);
  }

  async updateStatus(id: string, status: ToyStatus): Promise<Toy> {
    const toy = await this.findOne(id);
    toy.status = status;
    
    // Auto-update last cleaned date if status is 'available'
    if (status === ToyStatus.AVAILABLE) {
      toy.lastCleaned = new Date();
    }
    
    await this.toyRepository.save(toy);
    return toy;
  }

  async getFeatured(limit: number = 10): Promise<Toy[]> {
    return this.toyRepository.find({
      where: { isFeatured: true, isActive: true, status: ToyStatus.AVAILABLE },
      relations: ['images'],
      take: limit,
      order: { createdAt: 'DESC' },
    });
  }

  async getAvailableCount(): Promise<number> {
    return this.toyRepository.count({
      where: { status: ToyStatus.AVAILABLE, isActive: true },
    });
  }

  // Mettre à jour la caution de tous les jouets selon un pourcentage d'un prix de base
  async updateDepositForAll(percentage: number, base: 'daily' | 'weekly' | 'monthly' = 'daily'): Promise<number> {
    const toys = await this.toyRepository.find();
    let updated = 0;
    for (const toy of toys) {
      const daily = Number(toy.rentalPriceDaily || 0);
      const weekly = Number(toy.rentalPriceWeekly || 0);
      const monthly = Number(toy.rentalPriceMonthly || 0);
      let basePrice = 0;
      if (base === 'daily') basePrice = daily;
      else if (base === 'weekly') basePrice = weekly;
      else basePrice = monthly;

      // Si pas de prix base, sauter
      if (!basePrice || isNaN(basePrice)) continue;

      const newDeposit = Number(((basePrice * percentage) / 100).toFixed(2));
      toy.depositAmount = newDeposit;
      await this.toyRepository.save(toy);
      updated++;
    }
    return updated;
  }
}


