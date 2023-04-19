# ``util``
Contains various utility functions to make some tasks easier

```typescript
abstract class HttpFormattedException extends HttpException {
  constructor(error: IHttpError, response: number) {
    super(error, response)
  }
}
```

This is a class that extends the standard ``HttpException`` class from NestJS. You use it when you want the response body to look like this:
```json
{
  "statusCode": "some number",
  "message": ["an", "array", "of", "each", "error", "message"],
  "error": "Your error"
}
```

The class is an abstract one, so it cannot be instantiated. Instead, a few other classes extend it; the purpose of this is so that they can automatically provide the status code (based on the class itself). The current existing classes for this purpose are ``HttpForbiddenException``, ``HttpNotFoundException``, and ``HttpUnauthorizedException``.

## ``DtoTransformer``
An abstract class that can be used to map entity objects to the corresponding DTO object. All methods are static, so they can be used without instantiating the class.

```typescript
function extractTokenFromHeader(bearerToken: string | null | undefined): string
```
This function takes a string, ``null``, or ``undefined`` as an argument and attempts to retrieve the JWT token.

The string is typically passed as ``Bearer [token]``, with the function extracting the ``[token]`` part. The function returns an empty string if the provided value is ``null``, ``undefined``, or does not start with ``Bearer `` (**note:** this is case sensitive (``Bearer != bearer``) and the space after ``Bearer`` must be there).

```typescript
function sortBuilder(sortBy?: string, order?: string, page?: number | string): ISorter
```

This function lets you create an object with valid sort values. Pass it the ``sortBy``, ``order``, and ``page`` query parameter values from the controllers and you will get an ``ISorter`` object which can be safely used to retrieve sorted and paginated decks.