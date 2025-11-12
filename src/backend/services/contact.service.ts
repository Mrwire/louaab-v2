import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContactMessage } from '../entities/contact-message.entity';
import { CreateContactMessageDto, UpdateContactMessageDto, QueryContactMessagesDto } from '../dto/contact-message.dto';

@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(ContactMessage)
    private contactRepository: Repository<ContactMessage>,
  ) {}

  async create(createContactDto: CreateContactMessageDto): Promise<ContactMessage> {
    const contact = this.contactRepository.create(createContactDto);
    return this.contactRepository.save(contact);
  }

  async findAll(query: QueryContactMessagesDto): Promise<ContactMessage[]> {
    const { status } = query;
    const where: any = {};

    if (status) {
      where.status = status;
    }

    return this.contactRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<ContactMessage> {
    const contact = await this.contactRepository.findOne({ where: { id } });
    if (!contact) {
      throw new NotFoundException(`Contact message with ID "${id}" not found`);
    }
    return contact;
  }

  async update(id: string, updateContactDto: UpdateContactMessageDto): Promise<ContactMessage> {
    const contact = await this.findOne(id);
    this.contactRepository.merge(contact, updateContactDto);
    return this.contactRepository.save(contact);
  }

  async remove(id: string): Promise<void> {
    const result = await this.contactRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Contact message with ID "${id}" not found`);
    }
  }
}
