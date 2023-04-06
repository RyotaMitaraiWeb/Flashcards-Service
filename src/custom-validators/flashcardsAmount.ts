import { Injectable } from '@nestjs/common';
import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { CreateFlashcardDto } from '../modules/flashcards/dto/create-flashcard.dto';
import { validationRules } from '../constants/validationRules';
import { validationMessages } from '../constants/validationMessages';

/**
 * This validator checks if a deck has the minimum amount of flashcards required.
 * It will always fail validation if not passed an array.
 */
@ValidatorConstraint({ name: 'enoughFlashcards' })
@Injectable()
export class FlashcardsAmountValidator implements ValidatorConstraintInterface {
  validate(value: CreateFlashcardDto[]): boolean | Promise<boolean> {
    return value.length >= validationRules.deck.flashcards.minimumFlashcards;
  }

  defaultMessage?(validationArguments?: ValidationArguments): string {
    return validationMessages.deck.flashcards.notEnoughFlashcards;
  }

}