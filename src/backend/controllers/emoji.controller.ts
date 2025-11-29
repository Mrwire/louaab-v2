import { Controller, Get, Query } from '@nestjs/common';

@Controller('admin/emoji-presets')
export class EmojiController {
  private categoryEmojis = [
    '🎲','🧩','🚗','⚽','🎮','🎵','📚','👶','🎭','🎯',
    '🧸','🤖','🪀','🛴','🚀','🏎️','🪁','🎳','🪄','🛝'
  ];

  private ageEmojis = [
    '👶','👦','👧','🧒','🎒','🍼','🛝','🧸','🎈','🧠',
    '⭐','✨','🎁','🎉','📚','🎨','🎵','⚽','🚲','🏆'
  ];

  @Get()
  getPresets(@Query('type') type?: string) {
    const list = type === 'age' ? this.ageEmojis : this.categoryEmojis;
    return { success: true, data: list };
  }
}

