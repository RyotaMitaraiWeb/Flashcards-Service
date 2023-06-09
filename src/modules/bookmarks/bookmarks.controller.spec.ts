import { Test, TestingModule } from '@nestjs/testing';
import { BookmarksController } from './bookmarks.controller';
import { BookmarksService } from './bookmarks.service';
import { Bookmark } from './entities/bookmark.entity';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { Deck } from '../decks/entities/deck.entity';
import { IRequest, ISorter } from '../../interfaces';
import { HttpFormattedException } from '../../util/HttpFormattedException';
import { BookmarkDto } from './dto/bookmark.dto';
import { HttpNotFoundException } from '../../util/exceptions/HttpNotFoundException';
import { AllDecksDto } from '../decks/dto/all-decks-dto';
import { DeckListDto } from '../decks/dto/deck-list-dto';

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

const sort: ISorter = {
  page: 1,
  sortBy: 'title',
  order: 'asc'
}

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

    it('Throws an HttpFormattedException-based exception when the addBookmark service method throws one', async () => {
      jest.spyOn(bookmarkService, 'addBookmarkOrThrow').mockImplementation(async () => {
        throw new HttpNotFoundException('a');
      });

      expect(() => controller.addBookmark(req)).rejects.toThrow(HttpNotFoundException);
    });
  });

  describe('removeBookmark', () => {
    it('Returns an empty object when adding a bookmark successfully', async () => {
      jest.spyOn(bookmarkService, 'removeBookmarkOrThrow').mockImplementation(async () => new BookmarkDto());

      const result = await controller.removeBookmark(req);
      expect(result).toEqual({});
    });

    it('Throws an HttpFormattedException-based exception when the addBookmark service method throws one', async () => {
      jest.spyOn(bookmarkService, 'removeBookmarkOrThrow').mockImplementation(async () => {
        throw new HttpNotFoundException('a');
      });

      expect(() => controller.removeBookmark(req)).rejects.toThrow(HttpNotFoundException);
    });
  });

  describe('getSavedDecks', () => {
    const dto = new AllDecksDto();
    dto.authorId = req.user.id;
    dto.description = '';
    dto.id = 1;
    dto.title = 'a';
    
    it('Returns whatever the findUserBookmarks service method returns', async () => {
      jest.spyOn(bookmarkService, 'findUserBookmarks').mockImplementation(async () => (
        {
          decks: [dto],
          total: 1,
        }
      ));

      const result = await controller.getSavedDecks(req, sort.sortBy, sort.order, sort.page);
      expect(result).toEqual<DeckListDto>({
        decks: [dto],
        total: 1,
      });
    });
  });
});
