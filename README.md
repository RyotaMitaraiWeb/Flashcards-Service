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
  "token": "your token"
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


### Login

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
  "token": "your token"
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
}
```

```typescript
interface IRequestHeaders {
    authorization?: string;
}
```

The ``IRequest`` interface is used in contexts like guards where the request object isn't typed by default.

```typescript
interface IHttpError {
  message: string[];
  statusCode: number;
  error: string;
}
```

The ``IHttpError`` interface describes the standard format of error responses that are returned to the user.

## License
MIT