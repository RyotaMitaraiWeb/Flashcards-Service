# Decks
This module handles all requests to ``/decks``.

## Actions
### Creating a deck
To create a deck, send a POST request to ``/decks`` with the following JSON:

```json
{
  "title": "string",
  "description": "string",
  "flashcards": [
    {
      "front": "string",
      "back": "string"
    }
  ]
}
```

Make sure you have a valid JWT attached to the ``Authorization`` header in the format ``Bearer [jwt]``.

If successful, the server will respond with status 201 and this JSON:

```json
{
  "id": 0 // or whatever the deck's ID is
}
```

If there are validation errors, the server will respond with status 400 and an ``HttpFormattedException``-based JSON

**Note:** if any of the flashcards in the ``flashcards`` array have validation errors, those will be formatted like ``flashcards.0.[error_message]`` (or something similar). This is a limitation of ``class-validator``.

Refer to ``CreateDeckDto`` to see what validations are applied when creating a deck.

### Getting a deck
To get a specific deck, send a GET request to ``/decks/{id}`` (where ``{id}`` is the ID of the deck). The server will return the following JSON for status code 200:
```json
{
  "title": "your_title",
  "id": 0, // this will be the deck's ID instead
  "flashcards": [
    {
      "front": "your_front",
      "back": "your_back"
    }
  ],
  "description": "your_description",
  "authorId": 0, // this will be the author's account ID
  "bookmark": false // true if the user has bookmarked the deck
}
```

The deck retrieves only flashcards that match its ``version``. In other words, if the deck has a ``version`` of ``2``, that means that only flashcards that have a ``version`` of ``2`` will be part of the response.

If the deck does not exist or is marked as deleted, an ``HttpNotFoundException``-based JSON with status code 404 will be returned.

### Getting all decks
To get all decks that are not marked as deleted, send a GET request to ``/decks/all``. You will receive a JSON similar to this:
```json
[
  {
    "title": "string",
    "authorId": 0,
    "description": "string",
    "id": 0
  }
]
```

### Getting a user's decks
To get all decks created by a specific user, send a GET request to ``/decks/own`` and attach the user's JWT to the ``Authorization header``. The server will respond with 200 and the following JSON if the user is logged in:

```json
[
  {
    "title": "string",
    "authorId": 0,
    "description": "string",
    "id": 0
  }
]
```

### Searching decks by title
Send a GET request to ``/decks/search`` with a query parameter ``title`` to receive all decks that contain the given value in their titles. The response will look like this:

```json
[
  {
    "title": "string",
    "authorId": 0,
    "description": "string",
    "id": 0
  }
]
```


### Deleting a deck
To delete a deck, send a DELETE request to ``/decks/{id}`` and attach the creator's JWT to the ``Authorization`` header. The server will respond with 204 for a successful delete or an ``HttpFormattedException``-based JSON and status code of 401, 403, or 404, depending on the type of error.

**Note:** this will merely mark the deck as deleted, but it will remain in the database. However, it won't be retrieved in any of the API calls whatsoever.

### Editing a deck
To edit a deck, send a PUT request to ``/decks/{id}`` and attach the creator's JWT to the ``Authorization`` header with the same JSON format as for POST requests to ``/decks``. The server will respond with 204 for a successful edit or an ``HttpFormattedException``-based JSON and status code of 401, 403, or 404, depending on the type of error.

**Note:** this does not delete any previous flashcards. Rather, the deck's version is incremented and the flashcards in the submission are marked with the new version. Flashcards with older versions are not retrieved in GET requests.

### Sorting / paginating a list of decks
For all requests that are responded with an array of decks, you can send query parameters to control the pagination and the way the decks are sorted.

* To control the pagination, attach the query parameter ``page`` with a positive number. The current amount of decks per page is six. If the page is non-positive, non-numeric, or entirely missing, the server will default to page 1.
* To sort the decks, attach the queries ``sortBy`` with a valid category and ``order`` with ``asc`` or ``desc`` as values. The default configuration (in case those are missing or invalid) are ``title`` and ``asc``, respectively
* * Currently, you can only sort by the decks' titles.

## Entities
```typescript
class Deck {
  id: number;
  title: string;
  description: string;
  author: Account;
  flashcards: Flashcard[];
  authorId: number;
  version: number;
  isDeleted: boolean;
  userBookmarks: Bookmark[];
}
```

The ``version`` property is used to facilitate updating the decks. All ``flashcard``s of the deck also have a ``version`` property. When retrieving a deck with its flashcards, the API will only retrieve the flashcards with versions that match the deck.

When updating a deck, the version will typically be incremented and the flashcards that come with the submission will be added to the existing ones, but with the deck's new version (even if the flashcards are the same as the last version).

## DTOs
```typescript
class CreateDeckDto {
  title: string;
  description: string;
  flashcards: CreateFlashcardDto[];
}
```

This DTO is used when creating decks. The DTO is subject to the following validations:
* The title must be between 5 and 200 characters long.
* The description must not be longer than 500 characters long. However, the description is only optional
* The array of flashcards must have a length of 1 or higher.
* Each side of the flashcard must be between 1 and 150 characters long.

```typescript
class EditDeckDto {
  title: string;
  description: string;
  flashcards: CreateFlashcardDto[];
}
```

This DTO is used when editing decks. The DTO is subject to the following validations:
* The title must be between 5 and 200 characters long.
* The description must not be longer than 500 characters long. However, the description is only optional
* The array of flashcards must have a length of 1 or higher.
* Each side of the flashcard must be between 1 and 150 characters long.

```typescript
class GetDeckDto {
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
}
```

This DTO represents a retrieved deck with all relevant for the user properties. Typically used in ``/decks/{id}``.

```typescript
class AllDecksDto {
  id: number;
  title: string;
  description: string;
  authorId: number;
}
```

This DTO represents the information for decks that are provided in all requests that retrieve a deck of arrays.

## Services
Note: this documents only the public methods

```typescript
async function create(createDeckDto: CreateDeckDto, authorId: number): Promise<Deck>
```

Attempts to save a ``Deck`` entity with its corresponding ``Flashcard`` children to the database.

```typescript
async function findDeckById(id: number): Promise<GetDeckDto>
```

Retrieves the deck with the given ID or throws an ``HttpNotFoundException`` if the deck does not exist or its ``isDeleted`` property is ``true``. This will load the deck's ``flashcards``.

```typescript
async function updateDeck(id: number, editDeckDto: EditDeckDto): Promise<number>
```

Updates the deck with the given ID with the given data. Throws an ``HttpNotFoundException`` if the deck does not exist or its ``isDeleted`` property is ``true``.

When a deck is updated, its ``version`` will be incremented. The flashcards that come with the request will be added to the deck with the same version. When the flashcards are retrieved, the server will only return the flashcards that match the current deck version.

Note: this does not check if the user is the creator of the deck or not, use the ``IsCreatorGuard`` on the controller to prevent editing from third parties.

```typescript
async function getAllDecks(sortOptions: ISorter): Promise<AllDecksDto[]>
```

Returns all decks whose ``isDeleted`` is ``false``. ``sortOptions`` allows you to control how the result is paginated and sorted. Use the ``sortBuilder`` function in the controller to get a sorter object with valid values.

```typescript
async function getUserDecks(authorId: number, sortOptions: ISorter): Promise<AllDecksDto[]>
```

Returns all decks whose ``authorId`` matches the given parameter. ``sortOptions`` allows you to control how the result is paginated and sorted. Use the ``sortBuilder`` function in the controller to get a sorter object with valid values.

```typescript
async function searchDecksByTitle(title: string, sortOptions: ISorter): Promise<AllDecksDto[]>
```

Returns all decks that contain the given ``title`` in their titles (case insensitive) and whose ``isDeleted`` property is ``false``. ``sortOptions`` allows you to control how the result is paginated and sorted. Use the ``sortBuilder`` function in the controller to get a sorter object with valid values.