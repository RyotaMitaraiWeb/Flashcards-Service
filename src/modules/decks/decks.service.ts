import { Injectable } from '@nestjs/common';
import { CreateDeckDto } from './dto/create-deck.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Deck } from './entities/deck.entity';
import { Repository } from 'typeorm';
import { FlashcardsService } from '../flashcards/flashcards.service';

@Injectable()
export class DecksService {
  constructor(
    @InjectRepository(Deck)
    private readonly deckRepository: Repository<Deck>,
    private readonly flashcardsService: FlashcardsService,
  ) { }

  /**
   * Creates a deck with the provided flashcards.
   * @param createDeckDto the deck to be created
   * @param authorId the ID of the user creating the deck
   * @returns a Promise that resolves to the deck's id
   */
  async create(createDeckDto: CreateDeckDto, authorId: number): Promise<Deck> {
    const deck = new Deck();    
    const flashcards = createDeckDto.flashcards.map(f => this.flashcardsService.createFlashcardFromDto(f));

    deck.title = createDeckDto.title;
    deck.description = createDeckDto.description;
    deck.authorId = authorId;
    deck.flashcards = flashcards;
    
    await this.deckRepository.save(deck);
    return deck;
  }
}
