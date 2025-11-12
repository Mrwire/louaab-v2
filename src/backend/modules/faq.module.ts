import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FAQController } from '../controllers/faq.controller';
import { FAQService } from '../services/faq.service';
import { FAQ } from '../entities/faq.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([FAQ]),
  ],
  controllers: [FAQController],
  providers: [FAQService],
  exports: [FAQService],
})
export class FAQModule {}
