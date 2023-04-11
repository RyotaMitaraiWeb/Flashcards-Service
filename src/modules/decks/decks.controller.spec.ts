import { Test, TestingModule } from '@nestjs/testing';
import { DecksController } from './decks.controller';
import { DecksService } from './decks.service';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Deck } from './entities/deck.entity';
import { FlashcardsService } from '../flashcards/flashcards.service';
import { IRequest } from '../../interfaces';
import { CreateDeckDto } from './dto/create-deck.dto';
import { GetDeckDto } from './dto/get-deck.dto';
import { HttpFormattedException } from '../../util/HttpFormattedException';

describe('DecksController', () => {
  let controller: DecksController;
  let deckRepository: Repository<Deck>;
  let deckService: DecksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DecksController],
      providers: [
        DecksService,
        JwtService,
        FlashcardsService,
        {
          provide: getRepositoryToken(Deck),
          useClass: Repository,
        }
      ],
    }).compile();

    controller = module.get<DecksController>(DecksController);
    deckRepository = module.get<Repository<Deck>>(getRepositoryToken(Deck));
    deckService = module.get<DecksService>(DecksService);
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
    it('returns a GetDeckDto if service finds a deck successfully', async () => {
      const expectedDeck = new GetDeckDto();
      expectedDeck.id = 1;
      expectedDeck.authorId = 1;
      expectedDeck.flashcards = [{ front: 'a', back: 'a' }];
      expectedDeck.title = 'a';
      expectedDeck.description = '';

      jest.spyOn(deckService, 'findDeckByIdOrThrow').mockImplementation(async () => {
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

      const deck = await controller.findById(1);
      expect(deck).toEqual(expectedDeck);
    });

    it('Throws an HttpFormattedException when service throws the same error', async () => {
      jest.spyOn(deckService, 'findDeckByIdOrThrow').mockImplementation(async () => {
        throw new HttpFormattedException({
          error: '',
          message: [],
          statusCode: 1,
        }, 1);
      });

      expect(() => controller.findById(1)).rejects.toThrow(HttpFormattedException);
    });
  });
});
