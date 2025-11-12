import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ContactService } from '../services/contact.service';
import { CreateContactMessageDto, UpdateContactMessageDto, QueryContactMessagesDto } from '../dto/contact-message.dto';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createContactDto: CreateContactMessageDto) {
    return { success: true, data: await this.contactService.create(createContactDto), message: 'Message envoyé avec succès' };
  }

  @Get()
  async findAll(@Query() query: QueryContactMessagesDto) {
    return { success: true, data: await this.contactService.findAll(query) };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return { success: true, data: await this.contactService.findOne(id) };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateContactDto: UpdateContactMessageDto) {
    return { success: true, data: await this.contactService.update(id, updateContactDto), message: 'Message mis à jour avec succès' };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.contactService.remove(id);
    return { success: true, message: 'Message supprimé avec succès' };
  }
}
