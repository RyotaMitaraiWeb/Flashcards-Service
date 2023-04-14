import { INestApplication } from '@nestjs/common';
import { useContainer } from 'class-validator';
import { DecksModule } from '../../src/modules/decks/decks.module';
import { AccountsModule } from '../../src/modules/accounts/accounts.module';
import { BookmarksModule } from '../../src/modules/bookmarks/bookmarks.module';

const modules = [DecksModule, AccountsModule, BookmarksModule];

export function classValidatorContainer(app: INestApplication) {
  modules.forEach(m => {
    useContainer(app.select(m), { fallbackOnErrors: true });
  });
}