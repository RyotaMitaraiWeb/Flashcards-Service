import { Test, TestingModule } from '@nestjs/testing';
import { DecksService } from './decks.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Deck } from './entities/deck.entity';
import { FlashcardsService } from '../flashcards/flashcards.service';
import { CreateFlashcardDto } from '../flashcards/dto/create-flashcard.dto';
import { Flashcard } from '../flashcards/entities/flashcard.entity';
import { CreateDeckDto } from './dto/create-deck.dto';
import { GetDeckDto } from './dto/get-deck.dto';
import { HttpFormattedException } from '../../util/HttpFormattedException';

describe('DecksService', () => {
  let service: DecksService;
  let deckRepository: Repository<Deck>;
  let flashcardService: FlashcardsService;

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

        return deck;
      });

      const deck = await service.findDeckByIdOrThrow(1);
      expect(deck).toEqual({
        id: 1,
        description: '',
        flashcards: [{ front: 'a', back: 'a' }],
        title: 'a',
        authorId: 1,
      });
    });

    it('Throws an HttpFormattedException if deckRepository.findOne returns null', async () => {
      jest.spyOn(deckRepository, 'findOne').mockImplementation(async () => null);
      expect(() => service.findDeckByIdOrThrow(0)).rejects.toThrow(HttpFormattedException);
    });
  });

  describe('deleteDeckOrThrow', () => {
    beforeEach(async () => {
      jest.spyOn(deckRepository, 'save').mockImplementation(async () => new Deck());
    });

    it('returns the ID of the deck for successful delete', async () => {
      const deckId = 1;
      jest.spyOn(deckRepository, 'findOneBy').mockImplementation(async () => new Deck());

      const result = await service.deleteDeckOrThrow(deckId);
      expect(result).toBe<number>(deckId);
    });

    it('Throws an HttpFormattedException if findOneBy returns null', async () => {
      const deckId = 1;
      jest.spyOn(deckRepository, 'findOneBy').mockImplementation(async () => null);

      expect(() => service.deleteDeckOrThrow(deckId)).rejects.toThrow(HttpFormattedException);
    });
  });
});
