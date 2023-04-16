import { UserDto } from '../../modules/accounts/dto/user-dto';
import { Account } from '../../modules/accounts/entities/account.entity';
import { BookmarkDto } from '../../modules/bookmarks/dto/bookmark.dto';
import { Bookmark } from '../../modules/bookmarks/entities/bookmark.entity';
import { AllDecksDto } from '../../modules/decks/dto/all-decks-dto';
import { GetDeckDto } from '../../modules/decks/dto/get-deck.dto';
import { Deck } from '../../modules/decks/entities/deck.entity';
import { DtoTransformer } from './DtoTransformer';

describe('DtoTransformer', () => {
  const deck = new Deck();
    deck.title = 'a';
    deck.description = 'a';
    deck.flashcards = [{
      front: 'a',
      back: 'a',
      id: 1,
      version: 1,
      deck: new Deck(),
    }];
    deck.id = 1;
    deck.authorId = 1;

  const account = new Account();
  account.id = 1;
  account.username = 'a';

  describe('toBookmarkDto', () => {
    const bookmark = new Bookmark();
    bookmark.deckId = 1;
    bookmark.userId = 1;

    it('works', () => {
      const dto = DtoTransformer.toBookmarkDto(bookmark);
      expect(dto).toEqual<BookmarkDto>({
        userId: bookmark.userId,
        deckId: bookmark.deckId,
      });
    });
  });

  describe('toGetDeckDto', () => {
    it('works with one argument', () => {
      const dto = DtoTransformer.toGetDeckDto(deck);
      expect(dto).toEqual<GetDeckDto>({
        id: deck.id,
        title: deck.title,
        description: deck.description,
        authorId: deck.authorId,
        flashcards: [
          {
            front: deck.flashcards[0].front,
            back: deck.flashcards[0].back
          }
        ],
        bookmarked: false,
      });
    });

    it('works with two arguments', () => {
      const dto = DtoTransformer.toGetDeckDto(deck, true);
      expect(dto).toEqual<GetDeckDto>({
        id: deck.id,
        title: deck.title,
        description: deck.description,
        authorId: deck.authorId,
        flashcards: [
          {
            front: deck.flashcards[0].front,
            back: deck.flashcards[0].back
          }
        ],
        bookmarked: true,
      });
    });
  });

  describe('toAllDecksDto', () => {
    it('works', () => {
      const dto = DtoTransformer.toAllDecksDto(deck);
      expect(dto).toEqual<AllDecksDto>({
        id: deck.id,
        title: deck.title,
        description: deck.description,
        authorId: deck.authorId,
      });
    });
  });

  describe('toUserDto', () => {
    it('works', () => {
      const dto = DtoTransformer.toUserDto(account);
      expect(dto).toEqual<UserDto>({
        id: account.id,
        username: account.username,
      });
    });
  })
});