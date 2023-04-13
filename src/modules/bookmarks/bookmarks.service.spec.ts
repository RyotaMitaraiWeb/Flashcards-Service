import { Test, TestingModule } from '@nestjs/testing';
import { BookmarksService } from './bookmarks.service';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Deck } from '../decks/entities/deck.entity';
import { Bookmark } from './entities/bookmark.entity';
import { Repository } from 'typeorm';
import { HttpFormattedException } from '../../util/HttpFormattedException';
import { BookmarkDto } from './dto/bookmark.dto';

describe('BookmarksService', () => {
  let service: BookmarksService;
  let bookmarkRepository: Repository<Bookmark>;

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

    it('Throws an HttpFormattedException if the repository finds an existing bookmark', async () => {
      jest.spyOn(bookmarkRepository, 'findOne').mockImplementation(async () => new Bookmark());

      expect(() => service.addBookmarkOrThrow(expectedBookmark.userId, expectedBookmark.deckId))
        .rejects.toThrow(HttpFormattedException);
    });
  });
});
