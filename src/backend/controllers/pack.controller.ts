import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { PackService } from '../services/pack.service';
import { CreatePackDto, UpdatePackDto, QueryPacksDto } from '../dto/pack.dto';

@Controller('packs')
export class PackController {
  constructor(private readonly packService: PackService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createPackDto: CreatePackDto) {
    return { success: true, data: await this.packService.create(createPackDto), message: 'Pack créé avec succès' };
  }

  @Get()
  async findAll(@Query() query: QueryPacksDto) {
    return { success: true, data: await this.packService.findAll(query) };
  }

  @Get('all')
  async findAllForFrontend() {
    return { success: true, data: await this.packService.findAll({ isActive: true }) };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return { success: true, data: await this.packService.findOne(id) };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updatePackDto: UpdatePackDto) {
    return { success: true, data: await this.packService.update(id, updatePackDto), message: 'Pack mis à jour avec succès' };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.packService.remove(id);
    return { success: true, message: 'Pack supprimé avec succès' };
  }
}
