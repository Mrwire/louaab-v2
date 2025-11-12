import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { PricingService, PriceCalculationResult } from '../services/pricing.service';
import { CreatePricingRuleDto, UpdatePricingRuleDto, UpdateToyPricesDto, CalculatePriceDto } from '../dto/pricing.dto';
import { PricingRule } from '../entities/pricing-rule.entity';
import { PriceHistory } from '../entities/price-history.entity';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('pricing')
@UseGuards(JwtAuthGuard)
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  /**
   * Calcule le prix pour un jouet
   */
  @Post('calculate/:toyId')
  async calculatePrice(
    @Param('toyId') toyId: string,
    @Body() calculatePriceDto: CalculatePriceDto,
  ): Promise<PriceCalculationResult> {
    return await this.pricingService.calculatePrice(toyId, calculatePriceDto.pricingType, {
      quantity: calculatePriceDto.quantity,
      startDate: calculatePriceDto.startDate ? new Date(calculatePriceDto.startDate) : undefined,
      endDate: calculatePriceDto.endDate ? new Date(calculatePriceDto.endDate) : undefined,
      customerType: calculatePriceDto.customerType as any,
    });
  }

  /**
   * Met à jour les prix d'un jouet
   */
  @Put('toy/:toyId')
  async updateToyPrices(
    @Param('toyId') toyId: string,
    @Body() updateToyPricesDto: UpdateToyPricesDto,
  ): Promise<{ message: string }> {
    await this.pricingService.updateToyPrices(
      toyId,
      {
        daily: updateToyPricesDto.daily,
        weekly: updateToyPricesDto.weekly,
        monthly: updateToyPricesDto.monthly,
      },
      updateToyPricesDto.reason,
      'admin', // TODO: Récupérer l'ID de l'utilisateur connecté
    );

    return { message: 'Prix mis à jour avec succès' };
  }

  /**
   * Crée une nouvelle règle de prix
   */
  @Post('rules')
  async createPricingRule(@Body() createPricingRuleDto: CreatePricingRuleDto): Promise<PricingRule> {
    const { validFrom, validUntil, ...ruleData } = createPricingRuleDto;

    return await this.pricingService.createPricingRule({
      ...ruleData,
      validFrom: validFrom ? new Date(validFrom) : undefined,
      validUntil: validUntil ? new Date(validUntil) : undefined,
    });
  }

  /**
   * Met à jour une règle de prix
   */
  @Put('rules/:ruleId')
  async updatePricingRule(
    @Param('ruleId') ruleId: string,
    @Body() updatePricingRuleDto: UpdatePricingRuleDto,
  ): Promise<PricingRule> {
    // TODO: Implémenter la mise à jour des règles
    throw new Error('Non implémenté');
  }

  /**
   * Supprime une règle de prix
   */
  @Delete('rules/:ruleId')
  async deletePricingRule(@Param('ruleId') ruleId: string): Promise<{ message: string }> {
    // TODO: Implémenter la suppression des règles
    throw new Error('Non implémenté');
  }

  /**
   * Obtient l'historique des prix pour un jouet
   */
  @Get('history/:toyId')
  async getPriceHistory(
    @Param('toyId') toyId: string,
    @Query('pricingType') pricingType?: string,
  ): Promise<PriceHistory[]> {
    return await this.pricingService.getPriceHistory(
      toyId,
      pricingType as any,
    );
  }

  /**
   * Obtient toutes les règles de prix
   */
  @Get('rules')
  async getAllPricingRules(): Promise<PricingRule[]> {
    // TODO: Implémenter la récupération de toutes les règles
    throw new Error('Non implémenté');
  }

  /**
   * Obtient les règles de prix pour un jouet spécifique
   */
  @Get('rules/toy/:toyId')
  async getPricingRulesForToy(@Param('toyId') toyId: string): Promise<PricingRule[]> {
    // TODO: Implémenter la récupération des règles pour un jouet
    throw new Error('Non implémenté');
  }
}
