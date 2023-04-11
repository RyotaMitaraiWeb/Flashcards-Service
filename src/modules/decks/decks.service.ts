import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateDeckDto } from './dto/create-deck.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Deck } from './entities/deck.entity';
import { Repository } from 'typeorm';
import { FlashcardsService } from '../flashcards/flashcards.service';
import { HttpFormattedException } from '../../util/HttpFormattedException';
import { invalidActionsMessages } from '../../constants/invalidActionsMessages';
import { GetDeckDto } from './dto/get-deck.dto';
import { CreateFlashcardDto } from '../flashcards/dto/create-flashcard.dto';
import { Flashcard } from '../flashcards/entities/flashcard.entity';

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
    const flashcards = this.createFlashcardsFromDtoArray(createDeckDto.flashcards);

    deck.title = createDeckDto.title;
    deck.description = createDeckDto.description;
    deck.authorId = authorId;
    deck.flashcards = flashcards;

    await this.deckRepository.save(deck);
    return deck;
  }

  /**
   * Retrieves the ``deck`` with the given ID and loads its ``flashbacks`` or throws an 
   * ``HttpFormattedException`` if it does not exist or its ``isDeleted`` is set to ``true``.
   * @param id the ID of the deck to be retrieved
   * @returns a Promise that resolves to ``GetDeckDto`` if a deck exists.
   */
  async findDeckById(id: number): Promise<GetDeckDto> {
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

    deck.flashcards = this.removeFlashcardsThatDoNotMatchDeckVersion(deck.version, deck.flashcards);
    const dto = this.ToGetDeckDto(deck);
    return dto;
  }

  /**
   * Sets the ``isDeleted`` property of the deck with the given ``id`` to ``true`` or
   * throws a Not Found error.
   * @param id the ID of the deck to be deleted
   * @returns a Promise that resolves to ``id``
   */
  async deleteDeckOrThrow(id: number): Promise<number> {
    const deck = await this.findDeckByIdOrThrow(id);

    deck.isDeleted = true;
    await this.deckRepository.save(deck);
    return id;
  }

  private async findDeckByIdOrThrow(id: number): Promise<Deck> {
    const deck = await this.deckRepository.findOneBy({
      id,
      isDeleted: false,
    });

    if (deck) {
      return deck;
    }

    throw new HttpFormattedException({
      message: [invalidActionsMessages.deckDoesNotExist],
      error: 'Not Found',
      statusCode: HttpStatus.NOT_FOUND,
    }, HttpStatus.NOT_FOUND);
  }

  /**
   * Returns a ``Flashcard`` representation of a ``createFlashcardDto`` array
   * @param flashcards an array of ``CreateFlashcardDto``
   * @returns an array of ``Flashcard``s
   */
  private createFlashcardsFromDtoArray(flashcards: CreateFlashcardDto[]): Flashcard[] {
    return flashcards.map(f => this.flashcardsService.createFlashcardFromDto(f));
  }

  /**
   * Returns all flashcards whose ``version`` matches the deck's ``version``.
   * @param deckVersion the deck's current version
   * @param flashcards the deck's flashcards
   * @returns an array of ``Flashcard``s whose ``version`` matches the deck's ``version``
   */
  private removeFlashcardsThatDoNotMatchDeckVersion(deckVersion: number, flashcards: Flashcard[]) {
    return flashcards.filter(f => f.version === deckVersion);
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
