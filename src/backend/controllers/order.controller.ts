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
} from '@nestjs/common';
import { OrderService } from '../services/order.service';
import { CreateOrderDto, UpdateOrderDto, QueryOrdersDto } from '../dto/create-order.dto';
import { OrderStatus } from '../entities/order.entity';
import { AdminAuthGuard, CustomerAuthGuard } from '../guards/jwt-auth.guard';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @UseGuards(CustomerAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createOrderDto: CreateOrderDto) {
    return {
      success: true,
      data: await this.orderService.create(createOrderDto),
      message: 'Commande créée avec succès',
    };
  }

  @Get()
  @UseGuards(AdminAuthGuard)
  async findAll(@Query() query: QueryOrdersDto) {
    return {
      success: true,
      data: await this.orderService.findAll(query),
    };
  }

  @Get('stats')
  @UseGuards(AdminAuthGuard)
  async getStats() {
    return {
      success: true,
      data: await this.orderService.getStats(),
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return {
      success: true,
      data: await this.orderService.findOne(id),
    };
  }

  @Patch(':id')
  @UseGuards(AdminAuthGuard)
  async update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return {
      success: true,
      data: await this.orderService.update(id, updateOrderDto),
      message: 'Commande mise à jour avec succès',
    };
  }

  @Patch(':id/status')
  @UseGuards(AdminAuthGuard)
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: OrderStatus,
  ) {
    return {
      success: true,
      data: await this.orderService.updateStatus(id, status),
      message: 'Statut mis à jour avec succès',
    };
  }

  @Delete(':id')
  @UseGuards(AdminAuthGuard)
  @HttpCode(HttpStatus.OK)
  async cancel(@Param('id') id: string) {
    return {
      success: true,
      data: await this.orderService.cancel(id),
      message: 'Commande annulée avec succès',
    };
  }
}


