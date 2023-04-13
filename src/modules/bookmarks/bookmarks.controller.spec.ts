import { Test, TestingModule } from '@nestjs/testing';
import { BookmarksController } from './bookmarks.controller';
import { BookmarksService } from './bookmarks.service';
import { Bookmark } from './entities/bookmark.entity';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { Deck } from '../decks/entities/deck.entity';
import { IRequest } from '../../interfaces';
import { HttpFormattedException } from '../../util/HttpFormattedException';
import { BookmarkDto } from './dto/bookmark.dto';

const req: IRequest = {
  headers: {},
  params: {
    id: 1,
  },
  user: {
    id: 1,
    username: 'a',
  }
};

describe('BookmarksController', () => {
  let controller: BookmarksController;
  let bookmarkService: BookmarksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookmarksController],
      providers: [
        BookmarksService,
        JwtService,
        {
          provide: getRepositoryToken(Bookmark),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Deck),
          useClass: Repository,
        },
      ],
    }).compile();

    controller = module.get<BookmarksController>(BookmarksController);
    bookmarkService = module.get<BookmarksService>(BookmarksService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('addBookmark', () => {
    it('Returns an empty object when adding a bookmark successfully', async () => {
      jest.spyOn(bookmarkService, 'addBookmarkOrThrow').mockImplementation(async () => new BookmarkDto());

      const result = await controller.addBookmark(req);
      expect(result).toEqual({});
    });

    it('Throws an HttpFormattedException when the addBookmark service method throws one', async () => {
      jest.spyOn(bookmarkService, 'addBookmarkOrThrow').mockImplementation(async () => {
        throw new HttpFormattedException({
          error: '',
          message: [],
          statusCode: 1,
        }, 1);
      });

      expect(() => controller.addBookmark(req)).rejects.toThrow(HttpFormattedException);
    });
  });

  describe('removeBookmark', () => {
    it('Returns an empty object when adding a bookmark successfully', async () => {
      jest.spyOn(bookmarkService, 'removeBookmarkOrThrow').mockImplementation(async () => new BookmarkDto());

      const result = await controller.removeBookmark(req);
      expect(result).toEqual({});
    });

    it('Throws an HttpFormattedException when the addBookmark service method throws one', async () => {
      jest.spyOn(bookmarkService, 'removeBookmarkOrThrow').mockImplementation(async () => {
        throw new HttpFormattedException({
          error: '',
          message: [],
          statusCode: 1,
        }, 1);
      });

      expect(() => controller.removeBookmark(req)).rejects.toThrow(HttpFormattedException);
    });
  });
});
