import { Test, TestingModule } from '@nestjs/testing';
import { BookmarksService } from './bookmarks.service';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Deck } from '../decks/entities/deck.entity';
import { Bookmark } from './entities/bookmark.entity';
import { Repository } from 'typeorm';
import { BookmarkDto } from './dto/bookmark.dto';
import { HttpForbiddenException } from '../../util/exceptions/HttpForbiddenException';
import { DtoTransformer } from '../../util/dto-transform/DtoTransformer';
import { AllDecksDto } from '../decks/dto/all-decks-dto';
import { DeckListDto } from '../decks/dto/deck-list-dto';
import { ISorter } from '../../interfaces';

describe('BookmarksService', () => {
  let service: BookmarksService;
  let bookmarkRepository: Repository<Bookmark>;
  const sort: ISorter = {
    page: 1,
    sortBy: 'title',
    order: 'asc'
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookmarksService,
        JwtService,
        {
          provide: getRepositoryToken(Bookmark),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<BookmarksService>(BookmarksService);
    bookmarkRepository = module.get<Repository<Bookmark>>(getRepositoryToken(Bookmark));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addBookmarkOrThrow', () => {
    const expectedBookmark = new Bookmark();
      expectedBookmark.deckId = 1;
      expectedBookmark.userId = 1;

    beforeEach(() => {
      jest.spyOn(bookmarkRepository, 'save').mockImplementation(async () => expectedBookmark);
    });

    it('Returns a Bookmark object when successful', async () => {
      jest.spyOn(bookmarkRepository, 'findOne').mockImplementation(async () => null);

      const result = await service.addBookmarkOrThrow(expectedBookmark.userId, expectedBookmark.deckId);
      
      expect(result).toEqual<BookmarkDto>(expectedBookmark);
    });

    it('Throws an HttpForbiddenException if the repository finds an existing bookmark', async () => {
      jest.spyOn(bookmarkRepository, 'findOne').mockImplementation(async () => new Bookmark());

      expect(() => service.addBookmarkOrThrow(expectedBookmark.userId, expectedBookmark.deckId))
        .rejects.toThrow(HttpForbiddenException);
    });
  });

  describe('removeBookmarkOrThrow', () => {
    const expectedBookmark = new Bookmark();
      expectedBookmark.deckId = 1;
      expectedBookmark.userId = 1;

    beforeEach(() => {
      jest.spyOn(bookmarkRepository, 'save').mockImplementation(async () => expectedBookmark);
    });

    it('Returns a Bookmark object when successful', async () => {
      jest.spyOn(bookmarkRepository, 'findOne').mockImplementation(async () => {
        const bookmark = new Bookmark();
        bookmark.deckId = expectedBookmark.deckId;
        bookmark.userId = expectedBookmark.userId;

        return bookmark;
      });

      const result = await service.removeBookmarkOrThrow(expectedBookmark.userId, expectedBookmark.deckId);
      
      expect(result).toEqual<BookmarkDto>(expectedBookmark);
    });

    it('Throws an HttpForbiddenException if the repository does not find an existing bookmark', async () => {
      jest.spyOn(bookmarkRepository, 'findOne').mockImplementation(async () => null);

      expect(() => service.removeBookmarkOrThrow(expectedBookmark.userId, expectedBookmark.deckId))
        .rejects.toThrow(HttpForbiddenException);
    });
  });

  describe('findUserBookmarks', () => {
    const deck = new Deck();
    deck.authorId = 1;
    deck.id = 1;
    deck.title = 'a';
    deck.description = '';

    const dto = DtoTransformer.toAllDecksDto(deck);

    it('Returns a DeckListDto when successful', async () => {
      jest.spyOn(bookmarkRepository, 'findAndCount').mockImplementation(async () => {
        const bookmark = new Bookmark();
        bookmark.deck = deck;

        const bookmarks = [bookmark];
        return [bookmarks, 1];
      });

      const result = await service.findUserBookmarks(deck.authorId, sort);

      expect(result).toEqual<DeckListDto>(
        {
          decks: [dto],
          total: 1,
        }
      );
    });

    it('Works normally if the repository returns an empty array', async () => {
      jest.spyOn(bookmarkRepository, 'findAndCount').mockImplementation(async () => [[], 0]);

      const result = await service.findUserBookmarks(deck.authorId, sort);

      expect(result).toEqual<DeckListDto>({
        decks: [],
        total: 0,
      });
    });
  });

  describe('checkIfUserHasBookmarkedDeck', () => {
    it('Returns true when the repository finds a bookmark', async () => {
      jest.spyOn(bookmarkRepository, 'findOneBy').mockImplementation(async () => new Bookmark());

      const exists = await service.checkIfUserHasBookmarkedDeck(1, 1);
      expect(exists).toBe(true);
    });

    it('Returns false when the repository does not find a bookmark', async () => {
      jest.spyOn(bookmarkRepository, 'findOneBy').mockImplementation(async () => null);

      const exists = await service.checkIfUserHasBookmarkedDeck(1, 1);
      expect(exists).toBe(false);
    });
  })
});
