import { IsString, MaxLength, MinLength } from 'class-validator';
import { validationRules } from '../../../constants/validationRules';
import { validationMessages } from '../../../constants/validationMessages';
import { ApiProperty } from '@nestjs/swagger';

/**
 * class CreateFlashcardDto {
    front: string;
    back: string;
}
 */
export class CreateFlashcardDto {
  @MinLength(validationRules.flashcard.sideMinLength, {
    message: validationMessages.flashcard.sideIsTooShort
  })
  @MaxLength(validationRules.flashcard.sideMaxLength, {
    message: validationMessages.flashcard.sideIsTooLong
  })
  @IsString({
    message: validationMessages.flashcard.sideIsNotString
  })
  @ApiProperty({
    description: `Must be between ${validationRules.flashcard.sideMinLength} and ${validationRules.flashcard.sideMaxLength} characters long`,
  })
  front: string;

  @MinLength(validationRules.flashcard.sideMinLength, {
    message: validationMessages.flashcard.sideIsTooShort
  })
  @MaxLength(validationRules.flashcard.sideMaxLength, {
    message: validationMessages.flashcard.sideIsTooLong
  })
  @IsString({
    message: validationMessages.flashcard.sideIsNotString
  })
  @ApiProperty({
    description: `Must be between ${validationRules.flashcard.sideMinLength} and ${validationRules.flashcard.sideMaxLength} characters long`,
  })
  back: string;
}