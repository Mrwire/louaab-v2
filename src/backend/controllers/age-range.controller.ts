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
import { AgeRangeService } from '../services/age-range.service';
import { CreateAgeRangeDto, UpdateAgeRangeDto } from '../dto/age-range.dto';

@Controller('age-ranges')
export class AgeRangeController {
  constructor(private readonly ageRangeService: AgeRangeService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createAgeRangeDto: CreateAgeRangeDto) {
    return {
      success: true,
      data: await this.ageRangeService.create(createAgeRangeDto),
      message: 'Tranche d\'âge créée avec succès',
    };
  }

  @Get()
  async findAll() {
    return {
      success: true,
      data: await this.ageRangeService.findAll(),
    };
  }

  @Get('all')
  async findAllIncludingInactive() {
    return {
      success: true,
      data: await this.ageRangeService.findAllIncludingInactive(),
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return {
      success: true,
      data: await this.ageRangeService.findOne(id),
    };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateAgeRangeDto: UpdateAgeRangeDto) {
    return {
      success: true,
      data: await this.ageRangeService.update(id, updateAgeRangeDto),
      message: 'Tranche d\'âge mise à jour avec succès',
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.ageRangeService.remove(id);
    return {
      success: true,
      message: 'Tranche d\'âge supprimée avec succès',
    };
  }

  @Get(':id/toys-count')
  async getToysCount(@Param('id') id: string) {
    return {
      success: true,
      data: {
        count: await this.ageRangeService.getToysCount(id),
      },
    };
  }
}

