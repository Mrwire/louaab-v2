import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Toy } from '../entities/toy.entity';
import { ToyCategory } from '../entities/toy-category.entity';
import { ToyImage } from '../entities/toy-image.entity';
import { AgeRange } from '../entities/age-range.entity';
import { Pack, PackType } from '../entities/pack.entity';
import * as fs from 'fs';
import * as path from 'path';

interface MappingToy {
  id: number;
  name: string;
  slug: string;
  image: string;
  thumbnail: string;
  hasImage: boolean;
  category: string;
  age: string;
  price: string;
  rating: string;
  videoUrl: string;
  hasVideo: boolean;
  description: string;
  stock: string | number;
}

interface ToysMapping { toys: MappingToy[] }

@Injectable()
export class SyncService {
  constructor(
    @InjectRepository(Toy) private toyRepo: Repository<Toy>,
    @InjectRepository(ToyCategory) private catRepo: Repository<ToyCategory>,
    @InjectRepository(ToyImage) private imgRepo: Repository<ToyImage>,
    @InjectRepository(AgeRange) private ageRepo: Repository<AgeRange>,
    @InjectRepository(Pack) private packRepo: Repository<Pack>,
  ) {}

  private parsePrice(text?: string): number {
    if (!text) return 0;
    const clean = text.replace(/[^\d.,]/g, '').replace(',', '.');
    const n = parseFloat(clean);
    return isNaN(n) ? 0 : n;
  }

  private mapAgeToMonths(age: string): { min: number; max: number | null } | null {
    if (!age) return null;
    const lower = age.toLowerCase();
    const nums = lower.match(/\d+/g);
    if (!nums) return null;
    const a = parseInt(nums[0]);
    const b = nums[1] ? parseInt(nums[1]) : null;
    if (lower.includes('mois')) return { min: a, max: b ?? a };
    if (lower.includes('+')) return { min: a * 12, max: null };
    if (lower.includes('-') && b) return { min: a * 12, max: b * 12 };
    if (lower.includes('an')) return { min: a * 12, max: a * 12 };
    return null;
  }

  async syncToysFromMapping(): Promise<{ created: number; updated: number }>{
    const file = path.join(process.cwd(), 'public', 'toys', 'toys-mapping.json');
    const raw = fs.readFileSync(file, 'utf-8').replace(/^\uFEFF/, '').trim();
    const mapping: ToysMapping = JSON.parse(raw);

    let created = 0, updated = 0;

    for (const m of mapping.toys) {
      const catNames = (m.category || '').split(',').map(s => s.trim()).filter(Boolean);
      const categories: ToyCategory[] = [];
      if (catNames.length) {
        const existing = await this.catRepo.find({ where: { name: In(catNames) } });
        for (const name of catNames) {
          let c = existing.find(e => e.name === name);
          if (!c) {
            c = this.catRepo.create({ name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g,'-'), isActive: true, displayOrder: 0 } as any);
            await this.catRepo.save(c);
            existing.push(c);
          }
          categories.push(c);
        }
      }

      const range = this.mapAgeToMonths(m.age || '');
      let ageRel: AgeRange | null = null;
      if (range) {
        const ranges = await this.ageRepo.find();
        for (const ar of ranges) {
          const max = ar.ageMax ?? 9999;
          if (range.max !== null) {
            if (range.min <= max && range.max >= ar.ageMin) { ageRel = ar; break; }
          } else {
            if (range.min >= ar.ageMin) { ageRel = ar; break; }
          }
        }
      }

      const stockQty = parseInt(String(m.stock || '0')) || 0;
      const weekly = this.parsePrice(m.price);
      const daily = Math.round((weekly / 4.8) * 100) / 100;
      const monthly = Math.round((weekly * (15/4.8)) * 100) / 100;

      let toy = await this.toyRepo.findOne({ where: { slug: m.slug }, relations: ['images','categories'] });
      if (!toy) {
        toy = this.toyRepo.create({
          name: m.name,
          slug: m.slug,
          description: m.description,
          videoUrl: m.videoUrl,
          rentalPriceWeekly: weekly,
          rentalPriceDaily: daily,
          rentalPriceMonthly: monthly,
          stockQuantity: stockQty,
          availableQuantity: stockQty,
          isActive: true,
          categories,
        } as any);
        await this.toyRepo.save(toy);
        created++;
      } else {
        toy.name = m.name;
        toy.description = m.description;
        toy.videoUrl = m.videoUrl;
        toy.rentalPriceWeekly = weekly;
        toy.rentalPriceDaily = daily;
        toy.rentalPriceMonthly = monthly;
        toy.stockQuantity = stockQty;
        toy.availableQuantity = Math.max(toy.availableQuantity || 0, stockQty);
        toy.categories = categories;
        await this.toyRepo.save(toy);
        updated++;
      }

      if (m.image) {
        const hasPrimary = (toy.images || []).some(img => img.url === m.image);
        if (!hasPrimary) {
          const img = this.imgRepo.create({ toy, url: m.image, altText: m.name, isPrimary: true, displayOrder: 0 } as any);
          await this.imgRepo.save(img);
        }
      }
    }

    return { created, updated };
  }

  async syncPacksFromDefault(): Promise<{ created: number; updated: number }>{
    const file = path.join(process.cwd(), 'public', 'packs', 'default-packs.json');
    const raw = fs.readFileSync(file, 'utf-8').replace(/^\uFEFF/, '').trim();
    const items: Array<{
      name: string; slug: string; type: string; description: string; price: number; toyCount: number; durationDays: number; features: string[]; icon?: string; displayOrder?: number; isActive?: boolean;
    }> = JSON.parse(raw);

    let created = 0, updated = 0;
    for (const p of items) {
      let pack = await this.packRepo.findOne({ where: { slug: p.slug } });
      const data: Partial<Pack> = {
        name: p.name,
        slug: p.slug,
        type: (p.type?.toLowerCase() as PackType) || PackType.CUSTOM,
        description: p.description,
        price: p.price,
        toyCount: p.toyCount,
        durationDays: p.durationDays,
        features: JSON.stringify(p.features || []),
        icon: p.icon,
        displayOrder: p.displayOrder ?? 0,
        isActive: p.isActive ?? true,
      };
      if (!pack) {
        pack = this.packRepo.create(data as any);
        await this.packRepo.save(pack);
        created++;
      } else {
        this.packRepo.merge(pack, data);
        await this.packRepo.save(pack);
        updated++;
      }
    }

    return { created, updated };
  }
}
