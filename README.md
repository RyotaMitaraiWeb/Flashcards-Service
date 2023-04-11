# Flashcards server
A rewrite of my Flashcards server in NestJS

## How to run
```bash
npm install
```
You should have an ``.env`` file at the root of the project with something like this:

```bash
CORS_ORIGIN=""
DB_HOST=""
DB_PORT="" # typically 5432, project uses Postgre
DB_USERNAME=""
DB_PASSWORD=""
DB_NAME=""
STAGE="" # Set this to "DEV" during development. This will build a Swagger UI and synchronize database migrations 
JWT_SECRET=""
SALT_ROUNDS="" # used for password hashing, must be a number
```

After that:
```bash
npm run start:dev
```

visit ``http://localhost:3000/swagger`` for an interactive API interface.

## Running tests

```bash
npm run test # unit tests
npm run test:watch # run unit tests in watch mode
npm run test:e22 # end-to-end tests
```

## Modules
### Accounts
This module handles authentication

#### Register
To register a user, send a POST request to ``/account/register`` with the following JSON:
```json
{
  "username": "insert your username",
  "password": "insert your password"
}
```

Make sure that the ``Authorization`` header does not contain any valid JWTs, otherwise, the request won't go through.

The following validations are applied when registering a user:
* The username must be between 5 and 15 characters long and contain only alphanumeric English characters. The username must be unique.
* The password must be at least 6 characters long.

Upon a successful registration, you will receive the following JSON response with a status code of 201:
```json
{
  "token": "your token",
  "user": {
    "id": "your id",
    "username": "your username"
  }
}
```

If there are validation errors, the server will return a 400 error. If there is a valid JWT attached to the ``Authorization`` header, the server will return a 403 error. The lack of JWT requirement has a higher priority than validation errors (so if a request has validation errors AND an attached token, the server will return a 403 error). The JSON response of an error is as follows:

```json
{
  "statusCode": 400, // or 403
  "message": ["an", "array", "of", "each", "error", "message"],
  "error": "Bad Request" // or "Forbidden"
}
```

The ``IHttpError`` interface and ``HttpFormattedException`` class implement this structure.


#### Login

To log in a user (and thereby create a session), send a POST request to ``/account/login`` with the following JSON:
```json
{
  "username": "insert your username",
  "password": "insert your password"
}
```

Make sure that the ``Authorization`` header does not contain any valid JWTs, otherwise, the request won't go through.

Upon a successful authentication, you will receive the following JSON response with a status code of 201:
```json
{
  "token": "your token",
  "user": {
    "id": "your id",
    "username": "your username"
  }
}
```

If the password is wrong or the username does not exist, the server will return the following JSON with status code 401

```json
{
  "statusCode": 401,
  "message": ["Wrong username or password"],
  "error": "Unauthorized"
}
```
The ``IHttpError`` interface and ``HttpFormattedException`` class implement this structure.

#### Logout
To log out a user, send a DELETE request to ``/account/logout`` with a valid JWT attached to the ``Authorization`` header.

A successful logout returns status code 204 with no payload. The token that was sent to the server becomes unusable for future authorized requests.

An unsuccessful logout returns the following response:
```json
{
  "statusCode": 401,
  "message": ["You must be logged in to perform this action"],
  "error": "Unauthorized"
}
```

#### Session
To validate a session, send a POST request to ``/accounts/session`` with a JWT attached to the ``Authorization`` header in format ``Bearer [token]`` (where ``[token]`` is the JWT). If the JWT is valid, the server will respond with a status code 201 and the following response:
```json
{
  "token": "your token",
  "user": {
    "id": "your id",
    "username": "your username"
  }
}
```

An invalid JWT leads to the following response with status code 401:
```json
{
  "statusCode": 401,
  "message": ["You must be logged in to perform this action"],
  "error": "Unauthorized"
}
```

#### Checking if a username exists
Although the Account entity checks if the username exists when registering, you may want a way to check if the username exists without registering anything (such as when validating the username on the client). In this case, send a GET request to ``/accounts/username/{username}`` where ``{username}`` is the username to be checked. The server will respond with status code 200 if the username exists or 404 if the username does not exist. In both cases, the response body will be an empty object.

### Decks
#### Creating a deck
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

If there are validation errors, the server will respond with status 400 and this JSON:
```json
{
  "statusCode": 400,
  "message": ["array", "of", "errors"],
  "error": "Bad request"
}
```

**Note:** if any of the flashcards in the ``flashcards`` array have validation errors, those will be formatted like ``flashcards.0.[error_message]`` (or something similar). This is a limitation of ``class-validator``.

The following validations are applied when creating a deck:

* The title must be between 5 and 200 characters long.
* The description must not be longer than 500 characters long. However, the description is only optional
* The array of flashcards must have a length of 1 or higher.
* Each side of the flashcard must be between 1 and 150 characters long.

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
  "authorId": 0 // this will be the author's account ID
}
```

The deck retrieves only flashcards that match its ``version``. In other words, if the deck has a ``version`` of ``2``, that means that only flashcards that have a ``version`` of ``2`` will be part of the response.

If the deck does not exist or is marked as deleted, the following JSON will be returned:
```json
{
  "message": [
    "The deck you are looking for does not exist"
  ],
  "error": "Not Found",
  "statusCode": 404
}
```

## Custom validators
### ``UniqueUsername``
This validator checks if the username is already taken by another user.

## ``util``
Contains various utility functions to make some tasks easier
### ``HttpFormattedException``
This is a class that extends the standard ``HttpException`` class from NestJS. You throw it when you want the response body to look like this:
```json
{
  "statusCode": "some number",
  "message": ["an", "array", "of", "each", "error", "message"],
  "error": "Your error"
}
```

### ``extractTokenFromHeader``
This function takes a string, ``null``, or ``undefined`` as an argument and attempts to retrieve the JWT token.

The string is typically passed as ``Bearer [token]``, with the function extracting the ``[token]`` part. The function returns an empty string if the provided value is ``null``, ``undefined``, or does not start with ``Bearer `` (**note:** this is case sensitive (``Bearer != bearer``) and the space after ``Bearer`` must be there).

## Guards
### IsGuest
This guard aborts requests that have a valid JWT attached to the ``Authorization`` header.

### IsLoggedIn
This guard aborts requests that do not have a valid JWT attached to the ``Authorization`` header.

## Constants
Those are objects that contain some constant values, such as validation rule values, error messages, and etc.

Currently, there are objects for constant values related to (alongside the names of the variables):
* validation error messages (e.g. a username that is too short) - ``validationMessages``
* error messages for invalid actions (e.g. failed login) - ``invalidActionsMessages``
* validation rules values (e.g. the minimum amount of characters that a username should have) - ``validationRules``

## Interfaces

```typescript
interface IRequest {
  headers: IRequestHeaders;
  user?: IUser;
}
```

```typescript
interface IRequestHeaders {
    authorization?: string;
}
```

The ``IRequest`` interface is used in contexts like guards where the request object isn't typed by default.

```typescript
interface IUsernameExistsRequestParams {
  username: string;
}
```
The ``IUsernameExistsRequestParams`` interface represents the request parameters that are sent to the ``/accounts/username/{username}`` endpoint.

```typescript
interface IHttpError {
  message: string[];
  statusCode: number;
  error: string;
}
```

The ``IHttpError`` interface describes the standard format of error responses that are returned to the user.

```typescript
interface IUser {
  id: number;
  username: string;
}
```

The ``IUser`` interface represents the ``user`` object, which is part of the response the server gives upon a successful authentication.

```typescript
interface ICreatedSession {
  user: IUser;
  token: string;
}
```
The ``ICreatedSession`` interface represents the response that the server gives upon a successful authentication.

## License
MIT