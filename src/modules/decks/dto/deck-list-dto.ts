import { AllDecksDto } from './all-decks-dto';

/**
 * ```typescript
 * class DeckListDto {
    decks: AllDecksDto[];
    total: number;
}
 * ```
 * This is the response body of all requests that retrieve a list of decks.
 * ``total`` denotes the amount of all decks that would theoritically be retrieved
 * if there is no pagination.
 */
export class DeckListDto {
  decks: AllDecksDto[];
  total: number;
}