import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateDeckDto } from './dto/create-deck.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Deck } from './entities/deck.entity';
import { ILike, Repository } from 'typeorm';
import { FlashcardsService } from '../flashcards/flashcards.service';
import { HttpFormattedException } from '../../util/HttpFormattedException';
import { invalidActionsMessages } from '../../constants/invalidActionsMessages';
import { GetDeckDto } from './dto/get-deck.dto';
import { CreateFlashcardDto } from '../flashcards/dto/create-flashcard.dto';
import { Flashcard } from '../flashcards/entities/flashcard.entity';
import { EditDeckDto } from './dto/edit-deck.dto';
import { AllDecksDto } from './dto/all-decks-dto';
import { DtoTransformer } from '../../util/dto-transform/DtoTransformer';
import { HttpNotFoundException } from '../../util/exceptions/HttpNotFoundException';
import { ISorter } from '../../interfaces';
import { validationRules } from '../../constants/validationRules';
import { DeckListDto } from './dto/deck-list-dto';

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
   * Retrieves the ``deck`` with the given ID and loads its ``flashbacks`` and relevant properties
   * or throws an ``HttpNotFoundException`` if it does not exist 
   * or its ``isDeleted`` is set to ``true``.
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
        createdAt: true,
        updatedAt: true,
      },
      relations: {
        flashcards: true,
      }
    });

    if (!deck) {
      throw new HttpNotFoundException(invalidActionsMessages.deckDoesNotExist);
    }

    deck.flashcards = this.removeFlashcardsThatDoNotMatchDeckVersion(deck.version, deck.flashcards);
    const dto = DtoTransformer.toGetDeckDto(deck);
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

  /**
   * Updates the deck with the given data. A successful update will increment its
   * ``version`` by one. In addition, the deck will add the new flashcards with the new version;
   * any flashcard with an old version will no longer be retrieved in GET requests.
   * 
   * If the deck does not exist or is marked as deleted, a Not Found error is thrown.
   * @param id the ID of the deck to be updated
   * @param editDeckDto the new deck
   * @returns a Promise that resolves to the deck's ID
   */
  async updateDeck(id: number, editDeckDto: EditDeckDto): Promise<number> {
    const deck = await this.findDeckByIdOrThrow(id, true);
    const version = deck.version;
    deck.version++;

    deck.title = editDeckDto.title;
    deck.description = editDeckDto.description;

    const flashcards = this.createFlashcardsFromDtoArray(editDeckDto.flashcards, version + 1);
    deck.flashcards = deck.flashcards.concat(flashcards);

    await this.deckRepository.save(deck);
    return id;
  }

  /**
   * Returns an array of all decks that are not marked as deleted.   
   * 
   * **Note:** this loads only the decks' ``id``, ``title``, ``description``, and ``authorId``.
   * @param sortOptions

   * @returns a Promise that resolves to an ``AllDecksDto`` array
   */
  async getAllDecks(sortOptions: ISorter): Promise<DeckListDto> {
    const [decks, total] = await this.deckRepository.findAndCount({
      where: {
        isDeleted: false,
      },
      select: {
        id: true,
        title: true,
        description: true,
        authorId: true,
        createdAt: true,
        updatedAt: true,
      },
      order: {
        [sortOptions.sortBy]: sortOptions.order,
        id: 'asc',
      },
      take: validationRules.deck.search.limit,
      skip: (sortOptions.page - 1) * validationRules.deck.search.limit,
    });

    const allDecks = decks.map(d => DtoTransformer.toAllDecksDto(d));
    const deckList = DtoTransformer.ToDeckListDto(allDecks, total);
    return deckList;
  }

  /**
   * Finds all decks that have been saved by the user and have not been marked as deleted.
   * 
   * * **Note:** this loads only the decks' ``id``, ``title``, ``description``, and ``authorId``.
   * @param authorId 
   * @param sortOptions 
   * @returns 
   */
  async getUserDecks(authorId: number, sortOptions: ISorter): Promise<DeckListDto> {
    const [decks, total] = await this.deckRepository.findAndCount({
      where: {
        isDeleted: false,
        authorId,
      },
      select: {
        id: true,
        title: true,
        description: true,
        authorId: true,
        createdAt: true,
        updatedAt: true,
      },
      order: {
        [sortOptions.sortBy]: sortOptions.order,
        id: 'asc',
      },
      take: validationRules.deck.search.limit,
      skip: (sortOptions.page - 1) * validationRules.deck.search.limit,
    });

    const decksDto = decks.map(d => DtoTransformer.toAllDecksDto(d));
    const deckList = DtoTransformer.ToDeckListDto(decksDto, total);
    return deckList;
  }

  /**
   * Returns all decks that contain the given string in their title and are not marked as deleted.
   * 
   * **Note:** this loads only the decks' ``id``, ``title``, ``description``, and ``authorId``.
   * @param title the string to be searched
   * @param sortOptions 
   * @returns 
   */
  async searchDecksByTitle(title: string, sortOptions: ISorter): Promise<DeckListDto> {
    const [decks, total] = await this.deckRepository.findAndCount({
      where: {
        title: ILike(`%${title}%`),
        isDeleted: false,
      },
      order: {
        [sortOptions.sortBy]: sortOptions.order,
        id: 'asc',
      },
      take: validationRules.deck.search.limit,
      skip: (sortOptions.page - 1) * validationRules.deck.search.limit,
    });

    const dtos = decks.map(d => DtoTransformer.toAllDecksDto(d));
    const deckList = DtoTransformer.ToDeckListDto(dtos, total);
    return deckList;
  }
  
  /**
   * Retrieves the ``deck`` with the given ``id`` or throws a Not Found error
   * if the deck does not exist or is marked as deleted.
   * @param id the id of the deck
   * @returns a Promise that resolves to a ``Deck``
   */
  private async findDeckByIdOrThrow(id: number): Promise<Deck>;

  /**
   * Retrieves the ``deck`` with the given ``id`` and optionally loads
   * its flashcards or throws a Not Found error
   * if the deck does not exist or is marked as deleted.
   * @param id the id of the deck
   * @returns a Promise that resolves to a ``Deck``
   */
  private async findDeckByIdOrThrow(id: number, loadRelations: boolean): Promise<Deck>;
  private async findDeckByIdOrThrow(id: number, loadRelations = false): Promise<Deck> {
    const deck = await this.deckRepository.findOne({
      where: {
        id,
        isDeleted: false,
      },
      relations: {
        flashcards: loadRelations,
      }
    });

    if (deck) {
      return deck;
    }

    throw new HttpNotFoundException(invalidActionsMessages.deckDoesNotExist);
  }

  /**
   * Returns a ``Flashcard`` representation of a ``createFlashcardDto`` array. The ``version``
   * is set to ``1`` in the database automatically
   * @param flashcards an array of ``CreateFlashcardDto``
   * @returns an array of ``Flashcard``s
   */
  private createFlashcardsFromDtoArray(flashcards: CreateFlashcardDto[]): Flashcard[];

  /**
   * Returns a ``Flashcard`` representation of a ``createFlashcardDto`` array with the ``version``
   * set to a specific number (typically to the deck's new version when updating).
   * @param flashcards an array of ``CreateFlashcardDto``
   * @returns an array of ``Flashcard``s
   */
  private createFlashcardsFromDtoArray(flashcards: CreateFlashcardDto[], version: number): Flashcard[];
  private createFlashcardsFromDtoArray(flashcards: CreateFlashcardDto[], version?: number): Flashcard[] {
    if (!version) {
      return flashcards.map(f => this.flashcardsService.createFlashcardFromDto(f));
    }

    return flashcards.map(f => this.flashcardsService.createFlashcardFromDto(f, version));
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
}
