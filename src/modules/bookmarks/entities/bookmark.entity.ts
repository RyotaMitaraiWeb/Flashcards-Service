import { Column, Entity, JoinTable, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Deck } from '../../decks/entities/deck.entity';

/**
 * ```typescript
 * class Bookmark {
    id: number;
    deckId: number;
    userId: number;
    deck: Deck;
    isDeleted: boolean;
}
 * ```
 */
@Entity()
export class Bookmark {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  deckId: number;

  @Column()
  userId: number;

  @ManyToOne(() => Deck, d => d.userBookmarks)
  @JoinTable()
  deck: Deck;

  @Column({ default: false })
  isDeleted: boolean;
}
