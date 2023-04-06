import { TestingModule, Test } from '@nestjs/testing';
import { FlashcardsAmountValidator } from './flashcardsAmount';
import { CreateFlashcardDto } from '../modules/flashcards/dto/create-flashcard.dto';

describe('FlashcardsAmountValidator', () => {
  let validator: FlashcardsAmountValidator;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FlashcardsAmountValidator
      ],
    }).compile();

    validator = module.get<FlashcardsAmountValidator>(FlashcardsAmountValidator);
  });

  it('Returns true if enough CreateFlashcardDtos are passed', () => {
    const flashcards = [new CreateFlashcardDto()];

    expect(validator.validate(flashcards)).toBe(true);
  });

  it('Returns false if not enough CreateFlashcardDtos are passed', () => {
    const flashcards = [];

    expect(validator.validate(flashcards)).toBe(false);
  });

  it('Returns false if value is not a CreateFlashcardDto array', () => {
    expect(validator.validate(1 as any)).toBe(false);
  })
});