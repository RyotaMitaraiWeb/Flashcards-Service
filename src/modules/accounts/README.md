# Accounts module
This module handles authentication

## Actions
### Register
To register a user, send a POST request to ``/account/register`` with the following JSON:
```json
{
  "username": "insert your username",
  "password": "insert your password"
}
```

Make sure that the ``Authorization`` header does not contain any valid JWTs, otherwise, the request won't go through. Refer to ``RegisterDto`` for details about validation.

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

If there are validation errors, the server will return a 400 error. If there is a valid JWT attached to the ``Authorization`` header, the server will return a 403 error. The lack of JWT requirement has a higher priority than validation errors (so if a request has validation errors AND an attached token, the server will return a 403 error). The JSON response is an ``HttpFormattedException``-based JSON.

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
  "token": "your token",
  "user": {
    "id": "your id",
    "username": "your username"
  }
}
```

If the password is wrong or the username does not exist, the server will return an ``HttpFormattedException``-based JSON

### Logout
To log out a user, send a DELETE request to ``/account/logout`` with a valid JWT attached to the ``Authorization`` header.

A successful logout returns status code 204 with no payload. The token that was sent to the server becomes unusable for future authorized requests.

An unsuccessful logout returns an ``HttpFormattedException``-based JSON and status code 401.

### Session
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

An invalid JWT leads to an ``HttpFormattedException``-based JSON with status code 401.

### Checking if a username exists
Although the Account entity checks if the username exists when registering, you may want a way to check if the username exists without registering anything (such as when validating the username on the client). In this case, send a GET request to ``/accounts/username/{username}`` where ``{username}`` is the username to be checked. The server will respond with status code 200 if the username exists or 404 if the username does not exist. In both cases, the response body will be an empty object.

## Entities
### Account
```typescript
class Account {
  id: number;
  username: string;
  password: string;
  decks: Deck[];
}
```

## DTOs
```typescript
export class RegisterDto {
  public username: string;
  public password: string;
}
```
This DTO is used for POST requests to ``/accounts/register``.

The DTO is subject to the following validations:
* The username must be between 5 and 15 characters long and contain only alphanumeric English characters. The username must be unique (aka it has not already been registered by another user).
* The password must be at least 6 characters long.

```typescript
export class LoginDto {
  public username: string;
  public password: string;
}
```
This DTO is used for POST requests to ``/accounts/login``.

```typescript
class UserDto {
  id: number;
  username: string;
}
```
This DTO is used when generating JWTs.

## Service methods
Note: this documents only the public methods

```typescript
async function register(registerDto: RegisterDto): Promise<UserDto>
```
Attempts to create a new ``Account`` in the database, using the data from ``registerDto``. When successful, returns a Promise that resolves to a ``UserDto``.

**Note:** the password is hashed with ``bcrypt``.

```typescript
async function login(loginDto: LoginDto): Promise<UserDto>
```
Verifies the credentials provided by the user in the ``loginDto``. If the credentials are valid, returns a Promise that resolves to ``UserDto``, otherwise, throws an ``HttpUnauthorizedException``.

```typescript
async function logout(bearerToken: string): Promise<void> 
```
Adds the JWT from ``bearerToken`` to the ``jwtBlacklist``. The JWT blacklist is a ``Set`` of tokens that cannot be used for authorized requests.

**Note:** ``bearerToken`` must be in the format ``Bearer {jwt}``.

```typescript
async function checkIfUsernameExists(username: string): Promise<boolean>
```
Returns a Promise that resolves to a ``boolean`` that indicates whether the username has been registered by another user. This service is typically used for client-side validation, as ``RegisterDto`` already validates the username's uniqueness.

```typescript
async function generateToken(userDto: UserDto): Promise<string>
```
Returns a Promise that resolves to a JWT that represents ``userDto``.

```typescript
async function generateUserFromJWT(bearerToken: string): Promise<ICreatedSession>
```
Returns a Promise that resolves to an ``ICreatedSession`` object if successful. This object holds the user's token, as well as an  ``IUser`` representation of the user. If the token is invalid, throws an error.

**Note:** ``bearerToken`` must be in the format ``Bearer {jwt}``.