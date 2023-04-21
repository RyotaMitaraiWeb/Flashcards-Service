import { Test, TestingModule } from '@nestjs/testing';
import { DecksController } from './decks.controller';
import { DecksService } from './decks.service';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Deck } from './entities/deck.entity';
import { FlashcardsService } from '../flashcards/flashcards.service';
import { IRequest, ISorter } from '../../interfaces';
import { CreateDeckDto } from './dto/create-deck.dto';
import { GetDeckDto } from './dto/get-deck.dto';
import { EditDeckDto } from './dto/edit-deck.dto';
import { AllDecksDto } from './dto/all-decks-dto';
import { HttpNotFoundException } from '../../util/exceptions/HttpNotFoundException';
import { BookmarksService } from '../bookmarks/bookmarks.service';
import { Bookmark } from '../bookmarks/entities/bookmark.entity';
import { DtoTransformer } from '../../util/dto-transform/DtoTransformer';
import { DeckListDto } from './dto/deck-list-dto';

describe('DecksController', () => {
  let controller: DecksController;
  let deckRepository: Repository<Deck>;
  let deckService: DecksService;
  let bookmarkService: BookmarksService;

  const sort: ISorter = {
    page: 1,
    sortBy: 'title',
    order: 'asc'
  }

  const req: IRequest = {
    headers: {
      authorization: 'Bearer a',
    },
    user: {
      id: 1,
      username: 'a',
    },
    params: {
      id: 1,
    }
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DecksController],
      providers: [
        DecksService,
        JwtService,
        BookmarksService,
        FlashcardsService,
        {
          provide: getRepositoryToken(Deck),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Bookmark),
          useClass: Repository,
        }
      ],
    }).compile();

    controller = module.get<DecksController>(DecksController);
    deckRepository = module.get<Repository<Deck>>(getRepositoryToken(Deck));
    deckService = module.get<DecksService>(DecksService);
    bookmarkService = module.get<BookmarksService>(BookmarksService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('Returns the id of a successfully created deck', async () => {
      const deckId = 1;
      const dto = new CreateDeckDto();
      dto.title = 'abcde';
      dto.description = '';
      dto.flashcards = [];

      jest.spyOn(deckService, 'create').mockImplementation(async () => {
        const deck = new Deck();
        deck.id = deckId;

        return deck;
      });

      const request: IRequest = {
        params: {},
        headers: {
          authorization: 'Bearer a',
        },
        user: {
          id: 1,
          username: 'abcde',
        }
      }

      const result = await controller.create(dto, request);
      expect(result.id).toBe(1);
    });
  });

  describe('findById', () => {
    beforeEach(() => {
      jest.spyOn(bookmarkService, 'checkIfUserHasBookmarkedDeck').mockImplementation(async () => false);
    });

    it('returns a GetDeckDto if service finds a deck successfully', async () => {
      const expectedDeck = new GetDeckDto();
      expectedDeck.id = 1;
      expectedDeck.authorId = 1;
      expectedDeck.flashcards = [{ front: 'a', back: 'a' }];
      expectedDeck.title = 'a';
      expectedDeck.description = '';
      expectedDeck.bookmarked = false;

      jest.spyOn(deckService, 'findDeckById').mockImplementation(async () => {
        const dto = new GetDeckDto();
        dto.authorId = expectedDeck.authorId;
        dto.description = expectedDeck.description;
        dto.flashcards = [
          {
            front: expectedDeck.flashcards[0].front,
            back: expectedDeck.flashcards[0].back,
          }
        ];

        dto.id = expectedDeck.id;
        dto.title = expectedDeck.title;
        return dto;
      });

      const deck = await controller.findById(1, req);
      expect(deck).toEqual(expectedDeck);
    });

    it('Throws an HttpFormattedException-based exception when service throws the same error', async () => {
      jest.spyOn(deckService, 'findDeckById').mockImplementation(async () => {
        throw new HttpNotFoundException('a');
      });

      expect(() => controller.findById(1, req)).rejects.toThrow(HttpNotFoundException);
    });
  });

  describe('deleteDeck', () => {
    it('Returns an empty object for successful delete', async () => {
      const deckId = 1;
      jest.spyOn(deckService, 'deleteDeckOrThrow').mockImplementation(async () => deckId);

      const id = await controller.deleteDeck(deckId);

      expect(id).toEqual<object>({});
    });

    it('Throws an HttpFormattedException-based exception if deleteDeckOrThrow throws one', async () => {
      const deckId = 1;
      jest.spyOn(deckService, 'deleteDeckOrThrow').mockImplementation(async () => {
        throw new HttpNotFoundException('a');
      });

      expect(() => controller.deleteDeck(deckId)).rejects.toThrow(HttpNotFoundException);
    });
  });

  describe('updateDeck', () => {
    it('Returns an empty object for a successful update', async () => {
      const id = 1;
      jest.spyOn(deckService, 'updateDeck').mockImplementation(async () => id);

      const result = await controller.editDeck(id, new EditDeckDto());
      expect(result).toEqual({});
    });

    it('Throws an HttpFormattedException-based exception if updateDeck throws one', async () => {
      jest.spyOn(deckService, 'updateDeck').mockImplementation(async () => {
        throw new HttpNotFoundException('a');
      });

      expect(() => controller.editDeck(1, new EditDeckDto())).rejects.toThrow(HttpNotFoundException);
    });
  });

  describe('getAllDecks', () => {
    it('Returns whatever the getAllDecks service method returns', async () => {
      const dto = new AllDecksDto();
      dto.id = 1;
      dto.authorId = 1;
      dto.title = 'a';
      dto.description = 'a';
      jest.spyOn(deckService, 'getAllDecks').mockImplementation(async () => (
        {
          decks: [dto],
          total: 0,
        }
      ));

      const result = await controller.getAllDecks(sort.sortBy, sort.order, sort.page);
      expect(result).toEqual<DeckListDto>({
        decks: [dto],
        total: 0,
      });
    });

    it('Works correctly when the getAllDecks service method returns an empty array', async () => {
      jest.spyOn(deckService, 'getAllDecks').mockImplementation(async () => (
        {
          decks: [],
          total: 0,
        }
      ));

      const result = await controller.getAllDecks(sort.sortBy, sort.order, sort.page);
      expect(result).toEqual<DeckListDto>({
        decks: [],
        total: 0,
      });
    });
  });

  describe('getUserDecks', () => {
    const authorId = 1;
    const req: IRequest = {
      headers: {},
      params: {
        id: authorId,
      }
    }

    it('Returns whatever the getAllDecks service method returns', async () => {
      const dto = new AllDecksDto();
      dto.id = 1;
      dto.authorId = authorId;
      dto.title = 'a';
      dto.description = 'a';
      jest.spyOn(deckService, 'getUserDecks').mockImplementation(async () => {
        const deck = new AllDecksDto();
        deck.authorId = dto.authorId;
        deck.description = dto.description;
        deck.id = dto.id;
        deck.title = dto.title;

        const decks = [deck];
        const deckList = DtoTransformer.ToDeckListDto(decks, 1);
        return deckList;
      });

      const result = await controller.getUserDecks(req, sort.sortBy, sort.order, sort.page);
      expect(result).toEqual<DeckListDto>({
        decks: [dto],
        total: 1,
      });
    });

    it('Works correctly when the getAllDecks service method returns an empty array', async () => {
      jest.spyOn(deckService, 'getUserDecks').mockImplementation(async () => {
        const deckList = new DeckListDto();
        deckList.decks = [];
        deckList.total = 0;
        return deckList;
      });

      const result = await controller.getUserDecks(req, sort.sortBy, sort.order, sort.page);
      expect(result).toEqual<DeckListDto>({
        decks: [],
        total: 0,
      });
    });
  });

  describe('searchDecksByTitle', () => {
    it('Returns whatever searchDecksByTitle service method returns', async () => {
      const dto = new AllDecksDto();
      dto.title = 'a';
      dto.description = '';
      dto.id = 1;
      dto.authorId = 1;
      jest.spyOn(deckService, 'searchDecksByTitle').mockImplementation(async () => {
        const decks = DtoTransformer.ToDeckListDto([dto], 1);
        return decks;
      });

      const result = await controller.searchDecksByTitle(sort.sortBy, sort.order, sort.page, 'a');
      expect(result).toEqual<DeckListDto>({
        decks: [{
          id: dto.id,
          title: dto.title,
          description: dto.description,
          authorId: dto.authorId,
        }],
        total: 1
      });
    });

    it('Works correctly when searchDecksByTitle service method returns an empty array', async () => {
      jest.spyOn(deckService, 'searchDecksByTitle').mockImplementation(async () => {
        const decks = DtoTransformer.ToDeckListDto([], 0);
        return decks;
      });

      const result = await controller.searchDecksByTitle(sort.sortBy, sort.order, sort.page, 'a');
      expect(result).toEqual<DeckListDto>({
        decks: [],
        total: 0
      });
    });
  });
});
