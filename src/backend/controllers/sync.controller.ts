import { Controller, Post } from '@nestjs/common';
import { SyncService } from '../services/sync.service';

@Controller('admin/sync')
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Post('toys')
  async syncToys() {
    const res = await this.syncService.syncToysFromMapping();
    return { success: true, data: res, message: 'Toys synchronized from mapping' };
  }

  @Post('packs')
  async syncPacks() {
    const res = await this.syncService.syncPacksFromDefault();
    return { success: true, data: res, message: 'Packs synchronized from default' };
  }
}
