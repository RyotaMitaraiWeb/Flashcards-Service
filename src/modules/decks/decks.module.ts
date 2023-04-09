import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { DecksService } from './decks.service';
import { DecksController } from './decks.controller';
import { FlashcardsService } from '../flashcards/flashcards.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Deck } from './entities/deck.entity';
import { AttachUserFromTokenToRequestMiddleware } from '../../middlewares/attachUserFromTokenToRequest';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [DecksController],
  providers: [DecksService, FlashcardsService, JwtService],
  imports: [TypeOrmModule.forFeature([Deck])]
})
export class DecksModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AttachUserFromTokenToRequestMiddleware)
      .forRoutes({
        path: 'decks',
        method: RequestMethod.POST,
      })
  }
}
