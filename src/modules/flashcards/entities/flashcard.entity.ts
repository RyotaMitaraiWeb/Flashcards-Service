import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { validationRules } from '../../../constants/validationRules';
import { Deck } from '../../decks/entities/deck.entity';

/**
 * ```typescript
  class Flashcard {
    public id: number;
    public front: string;
    public back: string;
    public deck: Deck;
    public version: number;
}
```
 */
@Entity()
export class Flashcard {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({
    type: 'varchar',
    length: validationRules.flashcard.sideMaxLength,
  })
  public front: string;

  @Column({
    type: 'varchar',
    length: validationRules.flashcard.sideMaxLength,
  })
  public back: string;

  @ManyToOne(() => Deck, d => d.flashcards)
  public deck: Deck;

  /**
   * You can use the version property to retrieve only flashcards that match the deck's current version.
   * This is particularly useful to facilitate the updating of decks and their managing later on.
   */
  @Column({
    default: 1,
  })
  public version: number;
}