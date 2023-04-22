/**
 * ```typescript
 * class AllDecksDto {
    id: number;
    title: string;
    description: string;
    authorId: number; 
}
 * ```
 * This DTO is used for mapping the bodies of GET requests sent to ``/decks/all`` or ``/decks/own`` to the appropriate
 * object structure.
 */
export class AllDecksDto {
  id: number;
  title: string;
  description: string;
  authorId: number;
  createdAt: Date;
  updatedAt: Date;
}