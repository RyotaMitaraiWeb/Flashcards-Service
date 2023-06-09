/**
 * ```typescript
 * class GetDeckDto {
    id: number;
    title: string;
    description: string;
    authorId: number;
    flashcards: [
      {
        front: string;
        back: string;
      }
    ];
    createdAt: Date;
    updatedAt: Date;
}
 * ```
 * This DTO represents an object that is returned to GET requests to ``/decks/:id``
 */
export class GetDeckDto {
  id: number;
  title: string;
  description: string;
  authorId: number;
  flashcards:
    {
      front: string;
      back: string;
    }[];
  bookmarked: boolean = false;
  createdAt: Date;
  updatedAt: Date;
}