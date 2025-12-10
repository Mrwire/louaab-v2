import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpStatus,
  HttpCode,
  Header,
} from '@nestjs/common';
import { ToyService } from '../services/toy.service';
import { CreateToyDto, UpdateToyDto, QueryToysDto } from '../dto/create-toy.dto';
import { ToyStatus } from '../entities/toy.entity';

@Controller('toys')
export class ToyController {
  constructor(private readonly toyService: ToyService) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createToyDto: CreateToyDto) {
    return {
      success: true,
      data: await this.toyService.create(createToyDto),
      message: 'Jouet créé avec succès',
    };
  }

  @Get()
  @Header('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
  async findAll(@Query() query: QueryToysDto) {
    return {
      success: true,
      data: await this.toyService.findAll(query),
    };
  }

  @Get('featured')
  async getFeatured(@Query('limit') limit?: number) {
    return {
      success: true,
      data: await this.toyService.getFeatured(limit),
    };
  }

  @Get('stats')
  async getStats() {
    const availableCount = await this.toyService.getAvailableCount();
    return {
      success: true,
      data: {
        available: availableCount,
      },
    };
  }

  @Get(':id')
  @Header('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
  async findOne(@Param('id') id: string) {
    return {
      success: true,
      data: await this.toyService.findOne(id),
    };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateToyDto: UpdateToyDto) {
    return {
      success: true,
      data: await this.toyService.update(id, updateToyDto),
      message: 'Jouet mis à jour avec succès',
    };
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: ToyStatus,
  ) {
    return {
      success: true,
      data: await this.toyService.updateStatus(id, status),
      message: 'Statut mis à jour avec succès',
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.toyService.remove(id);
    return {
      success: true,
      message: 'Jouet supprimé avec succès',
    };
  }

  // Mise à jour de la caution en masse
  @Patch('deposit/bulk')
  async bulkUpdateDeposit(
    @Body('percentage') percentage: number,
    @Body('base') base: 'daily' | 'weekly' | 'monthly' = 'daily',
  ) {
    const updated = await this.toyService.updateDepositForAll(Number(percentage), base);
    return {
      success: true,
      data: { updated },
      message: `Caution mise à jour pour ${updated} jouet(s)`,
    };
  }

  @Post('increment-all-stock')
  async incrementAllStock() {
    const updated = await this.toyService.incrementStockForAll();
    return {
      success: true,
      data: { updated },
      message: `Stock incrémenté (+1) pour ${updated} jouet(s)`,
    };
  }
}
