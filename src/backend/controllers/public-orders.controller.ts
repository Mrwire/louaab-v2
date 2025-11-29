import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { CreatePublicOrderDto } from '../dto/public-order.dto';
import { PublicOrdersService } from '../services/public-orders.service';

@Controller('public/orders')
export class PublicOrdersController {
  constructor(private readonly publicOrdersService: PublicOrdersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createPublicOrderDto: CreatePublicOrderDto) {
    const order = await this.publicOrdersService.create(createPublicOrderDto);
    return {
      success: true,
      data: order,
      message: 'Commande enregistrée avec succès',
    };
  }
}
