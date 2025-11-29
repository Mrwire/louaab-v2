import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AgeRange } from '../entities/age-range.entity';
import { ToyCategory } from '../entities/toy-category.entity';
import { Pack, PackType } from '../entities/pack.entity';

@Injectable()
export class BootstrapService implements OnModuleInit {
  private readonly logger = new Logger(BootstrapService.name);

  constructor(
    @InjectRepository(AgeRange) private ageRepo: Repository<AgeRange>,
    @InjectRepository(ToyCategory) private catRepo: Repository<ToyCategory>,
    @InjectRepository(Pack) private packRepo: Repository<Pack>,
  ) {}

  async onModuleInit() {
    await this.ensureAgeRanges();
    await this.ensureCategories();
    await this.ensurePacks();
  }

  private async ensureAgeRanges() {
    const count = await this.ageRepo.count();
    if (count > 0) return;
    const items: Partial<AgeRange>[] = [
      { label: '0-12 mois', slug: '0-12-mois', iconType: 'emoji' as any, icon: '👶', ageMin: 0, ageMax: 12, displayOrder: 0, isActive: true },
      { label: '12-24 mois', slug: '12-24-mois', iconType: 'emoji' as any, icon: '🍼', ageMin: 12, ageMax: 24, displayOrder: 1, isActive: true },
      { label: '2-3 ans', slug: '2-3-ans', iconType: 'emoji' as any, icon: '🧒', ageMin: 24, ageMax: 36, displayOrder: 2, isActive: true },
      { label: '3-5 ans', slug: '3-5-ans', iconType: 'emoji' as any, icon: '🎒', ageMin: 36, ageMax: 60, displayOrder: 3, isActive: true },
      { label: '5-8 ans', slug: '5-8-ans', iconType: 'emoji' as any, icon: '⭐', ageMin: 60, ageMax: 96, displayOrder: 4, isActive: true },
      { label: '8+ ans', slug: '8-ans', iconType: 'emoji' as any, icon: '🚀', ageMin: 96, ageMax: null, displayOrder: 5, isActive: true },
    ];
    await this.ageRepo.save(this.ageRepo.create(items as any));
    this.logger.log(`Seeded ${items.length} age ranges`);
  }

  private async ensureCategories() {
    const count = await this.catRepo.count();
    if (count > 0) return;
    const items: Partial<ToyCategory>[] = [
      { name: 'Jeux éducatifs', slug: 'jeux-educatifs', iconType: 'emoji' as any, icon: '🧠', description: 'Montessori et pédagogie', displayOrder: 0, isActive: true },
      { name: 'Jeux de société', slug: 'jeux-de-societe', iconType: 'emoji' as any, icon: '🎲', description: 'Pour petits et grands', displayOrder: 1, isActive: true },
      { name: "Jeux d'adresse", slug: 'jeux-adresse', iconType: 'emoji' as any, icon: '🎯', description: 'Adresse et précision', displayOrder: 2, isActive: true },
      { name: 'Véhicules', slug: 'vehicules', iconType: 'emoji' as any, icon: '🚗', description: 'Voitures, motos, avions', displayOrder: 3, isActive: true },
      { name: 'Jeux créatifs', slug: 'jeux-creatifs', iconType: 'emoji' as any, icon: '🎨', description: 'Créativité et arts', displayOrder: 4, isActive: true },
    ];
    await this.catRepo.save(this.catRepo.create(items as any));
    this.logger.log(`Seeded ${items.length} categories`);
  }

  private async ensurePacks() {
    const count = await this.packRepo.count();
    if (count > 0) return;
    const items: Partial<Pack>[] = [
      { name: 'Mini Pack', slug: 'mini-pack', type: PackType.MINI, description: 'Parfait pour débuter', price: 199, toyCount: 3, durationDays: 30, features: JSON.stringify(['3 jouets','Échanges illimités','Livraison gratuite']), icon: '🎁', displayOrder: 0, isActive: true },
      { name: 'Maxi Pack', slug: 'maxi-pack', type: PackType.MAXI, description: 'Le plus populaire', price: 349, toyCount: 5, durationDays: 30, features: JSON.stringify(['5 jouets','Échanges illimités','Livraison gratuite']), icon: '⭐', displayOrder: 1, isActive: true },
      { name: 'Mega Pack', slug: 'mega-pack', type: PackType.MEGA, description: 'Pour familles', price: 499, toyCount: 8, durationDays: 30, features: JSON.stringify(['8 jouets','Échanges illimités','Livraison gratuite']), icon: '💎', displayOrder: 2, isActive: true },
    ];
    await this.packRepo.save(this.packRepo.create(items as any));
    this.logger.log(`Seeded ${items.length} packs`);
  }
}

