import { Test, TestingModule } from '@nestjs/testing';
import { DecksService } from './decks.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Deck } from './entities/deck.entity';
import { FlashcardsService } from '../flashcards/flashcards.service';
import { Flashcard } from '../flashcards/entities/flashcard.entity';
import { CreateDeckDto } from './dto/create-deck.dto';
import { EditDeckDto } from './dto/edit-deck.dto';
import { AllDecksDto } from './dto/all-decks-dto';
import { HttpNotFoundException } from '../../util/exceptions/HttpNotFoundException';
import { GetDeckDto } from './dto/get-deck.dto';
import { ISorter } from '../../interfaces';
import { DeckListDto } from './dto/deck-list-dto';

describe('DecksService', () => {
  let service: DecksService;
  let deckRepository: Repository<Deck>;
  let flashcardService: FlashcardsService;
  const sort: ISorter = {
    page: 1,
    sortBy: 'title',
    order: 'asc'
  }

  const date = new Date(Date.now());


  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DecksService,
        FlashcardsService,
        {
          provide: getRepositoryToken(Deck),
          useClass: Repository,
        }
      ],
    }).compile();

    service = module.get<DecksService>(DecksService);
    deckRepository = module.get<Repository<Deck>>(getRepositoryToken(Deck));
    flashcardService = module.get<FlashcardsService>(FlashcardsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('Returns a successfully created deck', async () => {
      const dto = new CreateDeckDto();
      dto.title = 'abcde';
      dto.description = '';
      dto.flashcards = [{ front: 'a', back: 'a' }];

      jest.spyOn(flashcardService, 'createFlashcardFromDto').mockImplementation(() => {
        const flashcard = new Flashcard();
        flashcard.front = dto.flashcards[0].front;
        flashcard.back = dto.flashcards[0].back;
        return flashcard;
      });

      jest.spyOn(deckRepository, 'save').mockImplementation(async () => {
        const deck = new Deck();
        deck.id = 1;

        return deck;
      });

      const authorId = 1;

      const deck = await service.create(dto, authorId);
      expect(deck.title).toBe(dto.title);
      expect(deck.description).toBe(dto.description);
      expect(deck.flashcards).toEqual(dto.flashcards);
      expect(deck.authorId).toEqual(authorId);
    });
  });

  describe('findDeckByIdOrThrow', () => {
    it('Successfully returns a GetDeckDto', async () => {
      jest.spyOn(deckRepository, 'findOne').mockImplementation(async () => {
        const deck = new Deck();
        deck.authorId = 1;
        deck.description = '';
        deck.flashcards = [{ front: 'a', back: 'a', id: 1, version: 1, deck: new Deck() }],
          deck.id = 1;
        deck.isDeleted = false;
        deck.title = 'a';
        deck.version = 1;
        deck.createdAt = date;
        deck.updatedAt = date;

        return deck;
      });

      const deck = await service.findDeckById(1);
      expect(deck).toEqual<GetDeckDto>({
        id: 1,
        description: '',
        flashcards: [{ front: 'a', back: 'a' }],
        title: 'a',
        authorId: 1,
        bookmarked: false,
        createdAt: date,
        updatedAt: date,
      });
    });

    it('Throws an HttpNotFoundException exception if deckRepository.findOne returns null', async () => {
      jest.spyOn(deckRepository, 'findOne').mockImplementation(async () => null);
      expect(() => service.findDeckById(0)).rejects.toThrow(HttpNotFoundException);
    });
  });

  describe('deleteDeckOrThrow', () => {
    beforeEach(async () => {
      jest.spyOn(deckRepository, 'save').mockImplementation(async () => new Deck());
    });

    it('returns the ID of the deck for successful delete', async () => {
      const deckId = 1;
      jest.spyOn(deckRepository, 'findOne').mockImplementation(async () => new Deck());

      const result = await service.deleteDeckOrThrow(deckId);
      expect(result).toBe<number>(deckId);
    });

    it('Throws an HttpNotFoundException if findOne returns null', async () => {
      const deckId = 1;
      jest.spyOn(deckRepository, 'findOne').mockImplementation(async () => null);

      expect(() => service.deleteDeckOrThrow(deckId)).rejects.toThrow(HttpNotFoundException);
    });
  });

  describe('updateDeck', () => {
    it('Returns the id if the update is successful', async () => {
      jest.spyOn(flashcardService, 'createFlashcardFromDto').mockImplementation(() => new Flashcard());
      jest.spyOn(deckRepository, 'findOne').mockImplementation(async () => {
        const deck = new Deck();
        deck.flashcards = [{
          front: '1',
          back: '2',
          version: 1,
          id: 1,
          deck: new Deck(),
        }]

        return deck;
      });
      jest.spyOn(deckRepository, 'save').mockImplementation(async () => new Deck());

      const id = 1;
      const dto = new EditDeckDto();
      dto.flashcards = [
        {
          front: 'a',
          back: 'b',
        }
      ];

      const result = await service.updateDeck(id, dto);
      expect(result).toBe<number>(id);
    });

    it('Throws an HttpNotFoundException when the deck cannot be found', async () => {
      jest.spyOn(deckRepository, 'findOne').mockImplementation(async () => null);

      expect(() => service.updateDeck(1, new EditDeckDto())).rejects.toThrow(HttpNotFoundException);
    });
  });

  describe('getAllDecks', () => {
    it('Returns a AllDecksDto array representation of whatever the repository returns', async () => {
      const dto = new AllDecksDto();
      dto.title = 'a';
      dto.description = 'a';
      dto.id = 1;
      dto.authorId = 1;

      jest.spyOn(deckRepository, 'findAndCount').mockImplementation(async () => {
        const deck = new Deck();
        deck.title = dto.title;
        deck.description = dto.description;
        deck.authorId = dto.authorId;
        deck.id = dto.id;

        const decks = [deck];
        return [decks, 1];
      });

      const result = await service.getAllDecks(sort);
      expect(result).toEqual<DeckListDto>({
        decks: [dto],
        total: 1,
      });
    });

    it('Works correctly when the repository returns an empty array', async () => {
      jest.spyOn(deckRepository, 'findAndCount').mockImplementation(async () => [[], 0]);
      
      const result = await service.getAllDecks(sort);
      expect(result).toEqual<DeckListDto>({
        decks: [],
        total: 0,
      });
    });
  });

  describe('getUserDecks', () => {
    it('Returns a DeckListDto representation of whatever the repository returns', async () => {
      const dto = new AllDecksDto();
      dto.title = 'a';
      dto.description = 'a';
      dto.id = 1;
      dto.authorId = 1;

      jest.spyOn(deckRepository, 'findAndCount').mockImplementation(async () => {
        const deck = new Deck();
        deck.title = dto.title;
        deck.description = dto.description;
        deck.authorId = dto.authorId;
        deck.id = dto.id;

        const decks = [deck];

        return [decks, 1];
      });

      const result = await service.getUserDecks(dto.authorId, sort);
      expect(result).toEqual<DeckListDto>({
        decks: [dto],
        total: 1,
      });
    });

    it('Works correctly when the repository returns an empty array', async () => {
      jest.spyOn(deckRepository, 'findAndCount').mockImplementation(async () => [[], 0]);
      
      const result = await service.getUserDecks(1, sort);
      expect(result).toEqual<DeckListDto>({
        decks: [],
        total: 0,
      });
    });
  });

  describe('searchDecksByTitle', () => {
    const sort: ISorter = {
      page: 1,
      sortBy: 'title',
      order: 'asc'
    };

    it('Returns an AllDecksDto array of whatever the repository returns', async () => {
      const dto = new AllDecksDto();
      dto.authorId = 1;
      dto.description = '';
      dto.id = 1;
      dto.title = 'a';

      jest.spyOn(deckRepository, 'findAndCount').mockImplementation(async () => {
        const deck = new Deck();
        deck.title = dto.title;
        deck.authorId = dto.authorId;
        deck.id = dto.id;
        deck.description = dto.description;
        deck.createdAt = date;
        deck.updatedAt = date;

        const decks = [deck];
        return [decks, decks.length];
      });

      const decks = await service.searchDecksByTitle('a', sort);
      expect(decks).toEqual<DeckListDto>({
        decks: [{
          id: dto.id,
          title: dto.title,
          authorId: dto.authorId,
          description: dto.description,
          createdAt: date,
          updatedAt: date,
        }],
        total: 1,
      });
    });

    it('Works correctly when the repository returns an empty array', async () => {
      jest.spyOn(deckRepository, 'findAndCount').mockImplementation(async () => [[], 0]);

      const decks = await service.searchDecksByTitle('a', sort);
      expect(decks).toEqual<DeckListDto>({
        decks: [],
        total: 0
      });
    });
  });
});
