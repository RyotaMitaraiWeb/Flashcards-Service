import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';
import { Account } from '../../src/modules/accounts/entities/account.entity';
import { Deck } from '../../src/modules/decks/entities/deck.entity';
import { Flashcard } from '../../src/modules/flashcards/entities/flashcard.entity';

export const options: DataSourceOptions = {
  type: 'better-sqlite3',
  database: ':memory:',
  dropSchema: true,
  synchronize: true,
  entities: [Account, Deck, Flashcard],
};

/**
 * This configures the end-to-end tests with an SQLite in-memory database.
 */
export const TypeOrmSQLITETestingModule = () => [
  TypeOrmModule.forRoot(options),
  TypeOrmModule.forFeature([Account, Deck, Flashcard]),
];