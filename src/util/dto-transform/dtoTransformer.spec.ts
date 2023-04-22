import { UserDto } from '../../modules/accounts/dto/user-dto';
import { Account } from '../../modules/accounts/entities/account.entity';
import { BookmarkDto } from '../../modules/bookmarks/dto/bookmark.dto';
import { Bookmark } from '../../modules/bookmarks/entities/bookmark.entity';
import { AllDecksDto } from '../../modules/decks/dto/all-decks-dto';
import { DeckListDto } from '../../modules/decks/dto/deck-list-dto';
import { GetDeckDto } from '../../modules/decks/dto/get-deck.dto';
import { Deck } from '../../modules/decks/entities/deck.entity';
import { DtoTransformer } from './DtoTransformer';

describe('DtoTransformer', () => {
  const date = new Date(Date.now());
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
  deck.createdAt = date;
  deck.updatedAt = date;
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
        createdAt: date,
        updatedAt: date,
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
        createdAt: date,
        updatedAt: date,
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
        createdAt: date,
        updatedAt: date,
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
  });

  describe('ToDeckListDto', () => {
    const dto = new AllDecksDto();
      dto.id = 1;
      dto.authorId = 1;
      dto.title = 'a';
      dto.description = 'a';

    it('works', () => {
      const result = DtoTransformer.ToDeckListDto([dto], 1);
      expect(result).toEqual<DeckListDto>({
        decks: [dto],
        total: 1,
      });
    });

    it('works with an empty array', () => {
      const result = DtoTransformer.ToDeckListDto([], 0);
      expect(result).toEqual<DeckListDto>({
        decks: [],
        total: 0,
      });
    });
  })
});