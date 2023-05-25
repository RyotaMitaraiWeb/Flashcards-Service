import { ArrayMinSize, IsArray, IsString, Length, MaxLength, MinLength, Validate, ValidateNested } from 'class-validator';
import { CreateFlashcardDto } from '../../flashcards/dto/create-flashcard.dto';
import { validationRules } from '../../../constants/validationRules';
import { validationMessages } from '../../../constants/validationMessages';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

/**
 * ```typescript
 * class CreateDeckDto {
    title: string;
    description: string;
    flashcards: CreateFlashcardDto[]
}
 * ```
 * This DTO is used for mapping the bodies of POST requests sent to ``/decks`` to the appropriate
 * object structure.
 */
export class CreateDeckDto {
  @MaxLength(validationRules.deck.title.maxLength, {
    message: validationMessages.deck.title.isTooLong,
  })
  @MinLength(validationRules.deck.title.minLength, {
    message: validationMessages.deck.title.isTooShort,
  })
  @IsString({
    message: validationMessages.deck.title.isNotString
  })
  @ApiProperty({
    description: `Must be between ${validationRules.deck.title.minLength} and ${validationRules.deck.title.maxLength} characters long`,
  })
  title: string;

  @MaxLength(validationRules.deck.description.maxLength, {
    message: validationMessages.deck.description.isTooLong,
  })
  @IsString({
    message: validationMessages.deck.description.isNotString
  })
  @ApiProperty({
    description: `Must be no more than ${validationRules.deck.description.maxLength} characters long. Not required`,
    required: false,
  })
  description: string;

  @IsArray({
    message: validationMessages.deck.flashcards.notEnoughFlashcards
  })
  @ValidateNested()
  @ArrayMinSize(validationRules.deck.flashcards.minimumFlashcards, {
    message: validationMessages.deck.flashcards.notEnoughFlashcards,
  })
  @Type(() => CreateFlashcardDto)
  @ApiProperty({
    description: `An array of flashcards. Must have at least ${validationRules.deck.flashcards.minimumFlashcards} flashcard(s)`,
    type: [CreateFlashcardDto],
  })
  flashcards: CreateFlashcardDto[];
}
