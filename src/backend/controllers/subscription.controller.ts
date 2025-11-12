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
import { SubscriptionService } from '../services/subscription.service';
import { CreateSubscriptionDto, UpdateSubscriptionDto, QuerySubscriptionsDto } from '../dto/create-subscription.dto';
import { AdminAuthGuard, CustomerAuthGuard, JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('subscriptions')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post()
  @UseGuards(CustomerAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createSubscriptionDto: CreateSubscriptionDto) {
    return {
      success: true,
      data: await this.subscriptionService.create(createSubscriptionDto),
      message: 'Abonnement créé avec succès',
    };
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@Query() query: QuerySubscriptionsDto) {
    return {
      success: true,
      data: await this.subscriptionService.findAll(query),
    };
  }

  @Get('stats')
  @UseGuards(AdminAuthGuard)
  async getStats() {
    return {
      success: true,
      data: await this.subscriptionService.getStats(),
    };
  }

  @Get('upcoming-renewals')
  @UseGuards(AdminAuthGuard)
  async getUpcomingRenewals(@Query('days') days?: number) {
    return {
      success: true,
      data: await this.subscriptionService.getUpcomingRenewals(days || 7),
    };
  }

  @Get('customer/:customerId')
  @UseGuards(JwtAuthGuard)
  async findByCustomer(@Param('customerId') customerId: string) {
    return {
      success: true,
      data: await this.subscriptionService.findByCustomer(customerId),
    };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string) {
    return {
      success: true,
      data: await this.subscriptionService.findOne(id),
    };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updateSubscriptionDto: UpdateSubscriptionDto,
  ) {
    return {
      success: true,
      data: await this.subscriptionService.update(id, updateSubscriptionDto),
      message: 'Abonnement mis à jour avec succès',
    };
  }

  @Post(':id/pause')
  @UseGuards(JwtAuthGuard)
  async pause(@Param('id') id: string) {
    return {
      success: true,
      data: await this.subscriptionService.pause(id),
      message: 'Abonnement mis en pause',
    };
  }

  @Post(':id/resume')
  @UseGuards(JwtAuthGuard)
  async resume(@Param('id') id: string) {
    return {
      success: true,
      data: await this.subscriptionService.resume(id),
      message: 'Abonnement réactivé',
    };
  }

  @Post(':id/renew')
  @UseGuards(AdminAuthGuard)
  async renew(@Param('id') id: string) {
    return {
      success: true,
      data: await this.subscriptionService.renew(id),
      message: 'Abonnement renouvelé avec succès',
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async cancel(@Param('id') id: string, @Body('reason') reason?: string) {
    return {
      success: true,
      data: await this.subscriptionService.cancel(id, reason),
      message: 'Abonnement annulé avec succès',
    };
  }
}


