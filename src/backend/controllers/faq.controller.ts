import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { FAQService } from '../services/faq.service';
import { CreateFAQDto, UpdateFAQDto, QueryFAQsDto } from '../dto/faq.dto';

@Controller('faqs')
export class FAQController {
  constructor(private readonly faqService: FAQService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createFAQDto: CreateFAQDto) {
    return { success: true, data: await this.faqService.create(createFAQDto), message: 'FAQ créée avec succès' };
  }

  @Get()
  async findAll(@Query() query: QueryFAQsDto) {
    return { success: true, data: await this.faqService.findAll(query) };
  }

  @Get('all')
  async findAllForFrontend() {
    return { success: true, data: await this.faqService.findAll({ isActive: true }) };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return { success: true, data: await this.faqService.findOne(id) };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateFAQDto: UpdateFAQDto) {
    return { success: true, data: await this.faqService.update(id, updateFAQDto), message: 'FAQ mise à jour avec succès' };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.faqService.remove(id);
    return { success: true, message: 'FAQ supprimée avec succès' };
  }
}
