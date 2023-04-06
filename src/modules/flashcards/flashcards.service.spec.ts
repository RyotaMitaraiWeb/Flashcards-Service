import { Test, TestingModule } from '@nestjs/testing';
import { FlashcardsService } from './flashcards.service';
import { CreateFlashcardDto } from './dto/create-flashcard.dto';

describe('FlashcardsService', () => {
  let service: FlashcardsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FlashcardsService],
    }).compile();

    service = module.get<FlashcardsService>(FlashcardsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('Returns a Flashcard entity', () => {
    const createFlashcardDto = new CreateFlashcardDto();
    createFlashcardDto.front = 'a';
    createFlashcardDto.back = 'a';

    const flashcard = service.createFlashcardFromDto(createFlashcardDto);
    expect(flashcard.front).toEqual(createFlashcardDto.front);
    expect(flashcard.back).toEqual(createFlashcardDto.back);
  });
});
