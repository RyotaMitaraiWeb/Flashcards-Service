import { Injectable } from '@nestjs/common';
import { Flashcard } from './entities/flashcard.entity';
import { CreateFlashcardDto } from './dto/create-flashcard.dto';

@Injectable()
export class FlashcardsService {
  /**Returns a ``Flashcard`` entity with the provided ``front`` and ``back``.
   * **Note:** this service does NOT save the flashcard to the database;
   * you need to call the appropriate repository's ``save`` method to save the Flashcard.
   */
 createFlashcardFromDto(createFlashcardDto: CreateFlashcardDto): Flashcard {
    const flashcard = new Flashcard();
    flashcard.front = createFlashcardDto.front;
    flashcard.back = createFlashcardDto.back;

    return flashcard;
  }
}
