import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AccountsModule } from './modules/accounts/accounts.module';
import { Account } from './modules/accounts/entities/account.entity';
import { DecksModule } from './modules/decks/decks.module';
import { FlashcardsModule } from './modules/flashcards/flashcards.module';
import { Deck } from './modules/decks/entities/deck.entity';
import { Flashcard } from './modules/flashcards/entities/flashcard.entity';
import { BookmarksModule } from './modules/bookmarks/bookmarks.module';
import { Bookmark } from './modules/bookmarks/entities/bookmark.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: './.env',
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [Account, Deck, Flashcard, Bookmark],
      synchronize: process.env.STAGE === 'DEV',
    }),
    AccountsModule,
    DecksModule,
    FlashcardsModule,
    BookmarksModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
