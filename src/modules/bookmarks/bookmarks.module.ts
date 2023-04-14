import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { BookmarksService } from './bookmarks.service';
import { BookmarksController } from './bookmarks.controller';
import { AttachUserFromTokenToRequestMiddleware } from '../../middlewares/attachUserFromTokenToRequest/attachUserFromTokenToRequest';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Deck } from '../decks/entities/deck.entity';
import { Bookmark } from './entities/bookmark.entity';

@Module({
  controllers: [BookmarksController],
  providers: [BookmarksService, JwtService],
  imports: [TypeOrmModule.forFeature([Deck, Bookmark])]
})
export class BookmarksModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AttachUserFromTokenToRequestMiddleware)
      .forRoutes(BookmarksController)
  }
}
