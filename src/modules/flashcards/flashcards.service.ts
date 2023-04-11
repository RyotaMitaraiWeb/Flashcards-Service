import { Injectable } from '@nestjs/common';
import { Flashcard } from './entities/flashcard.entity';
import { CreateFlashcardDto } from './dto/create-flashcard.dto';

@Injectable()
export class FlashcardsService {
  /**
   * Returns a ``Flashcard`` entity with the provided ``front`` and ``back``. This overload
   * is used when the deck is being created and the ``version`` will automatically be set to
   * ``1`` in the database.
   * 
   * **Note:** this service does NOT save the flashcard to the database;
   * you need to call the appropriate repository's ``save`` method to save the Flashcard.
   * @param createFlashcardDto 
   * @returns a ``Flashcard`` object
   */
  createFlashcardFromDto(createFlashcardDto: CreateFlashcardDto): Flashcard;

  /** Returns a ``Flashcard`` entity with the provided ``front``, ``back``, and ``version``.
   * This overload is used when the deck is being updated.
   * 
   * **Note:** this service does NOT save the flashcard to the database;
   * you need to call the appropriate repository's ``save`` method to save the Flashcard.
   * @param createFlashcardDto 
   * @param version - the version of the flashcard, will typically match the deck's new version
   * @returns a ``Flashcard`` object
   */
  createFlashcardFromDto(createFlashcardDto: CreateFlashcardDto, version: number): Flashcard;

  createFlashcardFromDto(createFlashcardDto: CreateFlashcardDto, version?: number): Flashcard {
    const flashcard = new Flashcard();
    flashcard.front = createFlashcardDto.front;
    flashcard.back = createFlashcardDto.back;
    if (version) {
      flashcard.version = version;
    }

    return flashcard;
  }
}
