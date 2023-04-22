# Bookmarks
This module handles users' saved decks

## Actions

### Adding a bookmark
In order to bookmark (save) a deck, send a POST request to ``/bookmarks/{id}`` where ``{id}`` is the deck's ID. Upon success, the server responds with status code 201 and an empty object.

The server won't bookmark a deck if the user is not logged in, is the creator of the deck, or has already bookmarked the deck.

### Deleting a bookmark
In order to remove a bookmark (unsave) a deck, send a DELETE request to ``/bookmarks/{id}`` where ``{id}`` is the deck's ID. Upon success, the server responds with status code 204.

The server won't remove a bookmark if the user is not logged in, is the creator of the deck, or has not bookmarked the deck on first place.

**Note:** this merely marks the bookmark as deleted, but it otherwise remains in the database. However, the bookmark API calls won't retrieve any bookmarks that are marked as deleted.

### Getting bookmarks
If you want to get all of the user's bookmarked decks, send a GET request to ``/bookmarks`` with a valid JWT attached to the ``Authorization`` header in the format ``Bearer {jwt}``. If the request is authorized, the server will respond with the following JSON structure:

```json
[
  {
    "title": "sometitle",
    "authorId": 0,
    "description": "somedescription",
    "id": 0
  }
]
```

If you want to check if the user has bookmarked a specific deck, refer to the decks controller.

## Entities

```typescript
class Bookmark {
  id: number;
  deckId: number;
  userId: number;
  deck: Deck;
  isDeleted: boolean;
}
```

## DTOs
```typescript
class BookmarkDto {
  deckId: number;
  userId: number;
}
```

## Services
Note: this documents only the public methods

```typescript
async function addBookmarkOrThrow(userId: number, deckId: number): Promise<BookmarkDto>
```

Attempts to save the given deck for the given user. Throws an ``HttpForbiddenException`` if such a combination already exists in the database (provided that neither the bookmark nor the deck are deleted).

```typescript
async function removeBookmarkOrThrow(userId: number, deckId: number): Promise<BookmarkDto>
```

Attempts to unsave the given deck for the given user. Throws an ``HttpForbiddenException`` if such a combination does not exist at all.

```typescript
async function findUserBookmarks(userId: number, sorter: ISorter): Promise<AllDecksDto[]>
```

Returns all decks that have been saved by the user and which are not marked as deleted, sorted and paginated. Use the ``sortBuilder`` function in the controller to receive an object with valid sort and pagination options.

```typescript
async function checkIfUserHasBookmarkedDeck(userId: number, deckId: number): Promise<boolean>
```

Checks if the user has saved the deck. Returns ``false`` if the user or the deck does not exist.