# Flashcards
This module handles some operations regarding flashcards. Unlike other modules, this one does not have any controllers; flashcards are saved in the decks module.

## Entities
```typescript
class Flashcard {
  public id: number;
  public front: string;
  public back: string;
  public deck: Deck;
  public version: number;
}
```

The ``version`` property is used to facilitate updating the decks. All ``flashcard``s of the deck also have a ``version`` property. When retrieving a deck with its flashcards, the API will only retrieve the flashcards with versions that match the deck.

When updating a deck, the version will typically be incremented and the flashcards that come with the submission will be added to the existing ones, but with the deck's new version (even if the flashcards are the same as the last version).

## DTOs
```typescript
class CreateFlashcardDto {
  front: string;
  back: string;
}
```

The following validations are applied to this DTO:
* Each side must be between 1 and 150 characters long.

## Services
```typescript
function createFlashcardFromDto(createFlashcardDto: CreateFlashcardDto): Flashcard;
function createFlashcardFromDto(createFlashcardDto: CreateFlashcardDto, version: number): Flashcard;
```

Returns a ``Flashcard`` object from the provided ``createFlashcardDto``. When updating the deck, ``version`` can be passed to match the new flashcards' versions to the deck.