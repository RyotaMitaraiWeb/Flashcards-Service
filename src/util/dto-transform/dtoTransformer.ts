import { UserDto } from '../../modules/accounts/dto/user-dto';
import { Account } from '../../modules/accounts/entities/account.entity';
import { BookmarkDto } from '../../modules/bookmarks/dto/bookmark.dto';
import { Bookmark } from '../../modules/bookmarks/entities/bookmark.entity';
import { AllDecksDto } from '../../modules/decks/dto/all-decks-dto';
import { DeckListDto } from '../../modules/decks/dto/deck-list-dto';
import { GetDeckDto } from '../../modules/decks/dto/get-deck.dto';
import { Deck } from '../../modules/decks/entities/deck.entity';

/**
 * Use this to convert various entity objects into DTOs.
 * This class is abstract and all methods are static.
 */
export abstract class DtoTransformer {
  /**
   * @param bookmark 
   * @returns a ``BookmarkDto`` representation of ``bookmark``
   */
  static toBookmarkDto(bookmark: Bookmark): BookmarkDto {
    const dto = new BookmarkDto();
    dto.deckId = bookmark.deckId;
    dto.userId = bookmark.userId;

    return dto;
  }

  /**
   * @param deck
   * @param bookmarked optionally mark the deck as bookmarked (default is ``false``)
   * @returns a ``GetDeckDto`` representation of ``deck``
   */
  static toGetDeckDto(deck: Deck, bookmarked = false): GetDeckDto {
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
    dto.bookmarked = bookmarked;

    return dto;
  }

  /**
   * @param deck
   * @returns an ``AllDecksDto`` representation of the ``deck``
   */
  static toAllDecksDto(deck: Deck): AllDecksDto {
    const dto = new AllDecksDto();
    dto.title = deck.title;
    dto.authorId = deck.authorId;
    dto.description = deck.description;
    dto.id = deck.id;

    return dto;
  }

  /**
   * @param account 
   * @returns a ``UserDto`` representation of ``account``
   */
  static toUserDto(account: Account): UserDto {
    const dto = new UserDto();
    dto.id = account.id;
    dto.username = account.username;
    return dto;
  }

  static ToDeckListDto(decks: AllDecksDto[], total: number): DeckListDto {
    const dto = new DeckListDto();
    dto.decks = decks;
    dto.total = total;
    return dto;
  }
}