import { BookmarkDto } from '../../modules/bookmarks/dto/bookmark.dto';
import { Bookmark } from '../../modules/bookmarks/entities/bookmark.entity';
import { AllDecksDto } from '../../modules/decks/dto/all-decks-dto';
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
   * @returns a ``GetDeckDto`` representation of ``deck``
   */
  static toGetDeckDto(deck: Deck): GetDeckDto {
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
}