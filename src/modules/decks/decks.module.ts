import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { DecksService } from './decks.service';
import { DecksController } from './decks.controller';
import { FlashcardsService } from '../flashcards/flashcards.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Deck } from './entities/deck.entity';
import { AttachUserFromTokenToRequestMiddleware } from '../../middlewares/attachUserFromTokenToRequest/attachUserFromTokenToRequest';
import { JwtService } from '@nestjs/jwt';
import { BookmarksService } from '../bookmarks/bookmarks.service';
import { Bookmark } from '../bookmarks/entities/bookmark.entity';

@Module({
  controllers: [DecksController],
  providers: [DecksService, FlashcardsService, JwtService, BookmarksService],
  imports: [TypeOrmModule.forFeature([Deck, Bookmark])]
})
export class DecksModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AttachUserFromTokenToRequestMiddleware)
      .forRoutes(DecksController)
  }
}
