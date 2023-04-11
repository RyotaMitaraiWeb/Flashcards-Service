import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { validationRules } from '../../../constants/validationRules';
import { Account } from '../../accounts/entities/account.entity';
import { Flashcard } from '../../flashcards/entities/flashcard.entity';

/**
 * ```typescript
 * class Deck {
    public id: number;
    public title: string;
    public description: string;
    public author: Account;
    public flashcards: Flashcard[];
    public authorId: number;
    public version: number;
    public isDeleted: boolean;
}
 * ```
 */
@Entity()
export class Deck {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({
    type: 'varchar',
    length: validationRules.deck.title.maxLength,
  })
  public title: string;

  @Column({
    type: 'varchar',
    length: validationRules.deck.description.maxLength,
  })
  public description: string;

  @ManyToOne(() => Account, a => a.decks)
  public author: Account;

  @OneToMany(() => Flashcard, f => f.deck, {
    nullable: false,
    cascade: true,
  })
  public flashcards: Flashcard[];

  @Column()
  public authorId: number;

  /**
   * The version property facilitates updating decks and managing them afterwards. All flashcards
   * also have a ``version`` property. When updating a deck, you can change its version and
   * simply add all flashcards from the update request with the deck's version. This allows you
   * to retrieve only the flashcards that match the deck's version.
   */
  @Column({ default: 1 })
  public version: number;

  @Column({ default: false })
  public isDeleted: boolean;
}
