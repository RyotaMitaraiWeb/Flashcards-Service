/**
 * ```typescript
 * class AllDecksDto {
    id: number;
    title: string;
    description: string;
    authorId: number; 
}
 * ```
 * This DTO is used for mapping the bodies of GET requests sent to ``/decks/all`` to the appropriate
 * object structure.
 */
export class AllDecksDto {
  id: number;
  title: string;
  description: string;
  authorId: number;
}