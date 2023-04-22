import { HttpStatus, Injectable } from '@nestjs/common';
import { BookmarkDto } from './dto/bookmark.dto';
import { DecksService } from '../decks/decks.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Bookmark } from './entities/bookmark.entity';
import { Repository } from 'typeorm';
import { Deck } from '../decks/entities/deck.entity';
import { HttpFormattedException } from '../../util/HttpFormattedException';
import { invalidActionsMessages } from '../../constants/invalidActionsMessages';
import { DtoTransformer } from '../../util/dto-transform/DtoTransformer';
import { HttpForbiddenException } from '../../util/exceptions/HttpForbiddenException';
import { AllDecksDto } from '../decks/dto/all-decks-dto';
import { DeckListDto } from '../decks/dto/deck-list-dto';
import { ISorter } from '../../interfaces';
import { validationRules } from '../../constants/validationRules';

@Injectable()
export class BookmarksService {
  constructor(
    @InjectRepository(Bookmark)
    private readonly bookmarkRepository: Repository<Bookmark>,
  ) { }
  
  /**
   * Saves the deck to the user's bookmarks or throws an ``HttpFormattedException`` if the operation is invalid
   * @param userId the ID of the user saving the deck
   * @param deckId the ID of the deck being saved
   * @returns a Promise that resolves to a ``BookmarkDto``
   */
  async addBookmarkOrThrow(userId: number, deckId: number): Promise<BookmarkDto> {
    const existingBookmark = await this.findBookmarkedDeck(userId, deckId);
    if (existingBookmark) {
      throw new HttpForbiddenException(invalidActionsMessages.hasAlreadyBookmarked)
    }

    const bookmark = new Bookmark();
    bookmark.deckId = deckId;
    bookmark.userId = userId;

    await this.bookmarkRepository.save(bookmark);

    const dto = DtoTransformer.toBookmarkDto(bookmark);
    return dto;
  }

  /**
   * Marks the bookmark of the given user's given deck as deleted or throws an error if this is
   * not possible.
   * @param userId the ID of the user saving the deck
   * @param deckId the ID of the deck being saved
   * @returns a Promise that resolves to a ``BookmarkDto``
   */
  async removeBookmarkOrThrow(userId: number, deckId: number): Promise<BookmarkDto> {
    const bookmark = await this.findBookmarkedDeck(userId, deckId);
    if (!bookmark) {
      throw new HttpForbiddenException(invalidActionsMessages.hasNotBookmarked)
    }

    bookmark.isDeleted = true;
    await this.bookmarkRepository.save(bookmark);

    const dto = DtoTransformer.toBookmarkDto(bookmark);
    return dto;
  }

  /**
   * returns all decks that have been saved by the user and have not been marked as deleted.
   * @param userId 
   * @param sortOptions determines how the pages will be sorted and paginated
   * @returns a Promise that resolves to a ``DeckListDto``
   */
  async findUserBookmarks(userId: number, sortOptions: ISorter): Promise<DeckListDto> {
    const [bookmarks, total] = await this.bookmarkRepository.findAndCount({
      where: {
        isDeleted: false,
        userId,
        deck: {
          isDeleted: false,
        }
      },
      select: {
        deck: {
          title: true,
          description: true,
          id: true,
          authorId: true,
        },
      },
      order: {
        deck: {
          [sortOptions.sortBy]: sortOptions.order,
          id: 'asc',
        },
      },
      take: validationRules.deck.search.limit,
      skip: (sortOptions.page - 1) * validationRules.deck.search.limit,
      relations: {
        deck: true,
      }
    });

    const decks = bookmarks.map(b => DtoTransformer.toAllDecksDto(b.deck));
    const dtos = DtoTransformer.ToDeckListDto(decks, total);
    return dtos;
  }

  async checkIfUserHasBookmarkedDeck(userId: number, deckId: number): Promise<boolean> {
    const bookmark = await this.bookmarkRepository.findOneBy({
      isDeleted: false,
      deckId,
      userId,
      deck: {
        isDeleted: false,
      }
    });

    return bookmark !== null;
  }

  /**
   * Finds the bookmark of the given user for the given deck, if such exists.
   * This loads the associated deck.
   * @param userId the ID of the user saving the deck
   * @param deckId the ID of the deck to be saved
   * @returns a Promise that resolves to a ``Bookmark`` object
   */
  private async findBookmarkedDeck(userId: number, deckId: number): Promise<Bookmark> {
    const bookmark = await this.bookmarkRepository.findOne({
      where: {
        userId,
        deckId,
        isDeleted: false,
        deck: {
          isDeleted: false,
        }
      },
      relations: {
        deck: true,
      }
    });

    return bookmark;
  }
}
