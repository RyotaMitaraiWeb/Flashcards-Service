import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateDeckDto } from './dto/create-deck.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Deck } from './entities/deck.entity';
import { Repository } from 'typeorm';
import { FlashcardsService } from '../flashcards/flashcards.service';
import { HttpFormattedException } from '../../util/HttpFormattedException';
import { invalidActionsMessages } from '../../constants/invalidActionsMessages';
import { GetDeckDto } from './dto/get-deck.dto';

@Injectable()
export class DecksService {
  constructor(
    @InjectRepository(Deck)
    private readonly deckRepository: Repository<Deck>,
    private readonly flashcardsService: FlashcardsService,
  ) { }

  /**
   * Creates a deck with the provided flashcards.
   * @param createDeckDto the deck to be created
   * @param authorId the ID of the user creating the deck
   * @returns a Promise that resolves to the deck's id
   */
  async create(createDeckDto: CreateDeckDto, authorId: number): Promise<Deck> {
    const deck = new Deck();    
    const flashcards = createDeckDto.flashcards.map(f => this.flashcardsService.createFlashcardFromDto(f));

    deck.title = createDeckDto.title;
    deck.description = createDeckDto.description;
    deck.authorId = authorId;
    deck.flashcards = flashcards;
    
    await this.deckRepository.save(deck);
    return deck;
  }
  
  /**
   * Retrieves the ``deck`` with the given ID or throws an ``HttpFormattedException``
   * if it does not exist or its ``isDeleted`` is set to ``true``.
   * @param id the ID of the deck to be retrieved
   * @returns a Promise that resolves to ``GetDeckDto`` if a deck exists.
   */
  async findDeckByIdOrThrow(id: number): Promise<GetDeckDto> {
    const deck = await this.deckRepository.findOne({
      where: {
        id,
        isDeleted: false,
      },
      select: {
        title: true,
        description: true,
        authorId: true,
        id: true,
        version: true,
        flashcards: true,
      },
      relations: {
        flashcards: true,
      }
    });

    if (!deck) {
      throw new HttpFormattedException({
        message: [invalidActionsMessages.deckDoesNotExist],
        error: 'Not Found',
        statusCode: HttpStatus.NOT_FOUND,
      }, HttpStatus.NOT_FOUND)
    }    

    deck.flashcards = deck.flashcards.filter(f => f.version === deck.version);
    const dto = this.ToGetDeckDto(deck);
    return dto;
  }

  /**
   * Converts a ``Deck`` object to a ``GetDeckDto`` object.
   * @param deck the ``Deck`` to be transformed
   * @returns a ``GetDeckDto`` representation of ``deck``
   */
  private ToGetDeckDto(deck: Deck): GetDeckDto {
    const dto = new GetDeckDto();
    dto.title = deck.title;
    dto.id = deck.id;
    dto.flashcards = deck.flashcards.map(f => {
      return {
        front: f.front,
        back: f.back
      };
    });
    dto.description = deck.description;
    dto.authorId = deck.authorId;

    return dto;
  }
}
