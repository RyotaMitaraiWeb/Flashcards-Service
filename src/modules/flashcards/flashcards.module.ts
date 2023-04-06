import { Module } from '@nestjs/common';
import { FlashcardsService } from './flashcards.service';

@Module({
  providers: [FlashcardsService]
})
export class FlashcardsModule {}
