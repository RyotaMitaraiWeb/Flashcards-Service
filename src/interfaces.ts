/**
 * ```typescript
 * interface IRequest {
    headers?: IRequestHeaders;
    user?: IUser;
    params: object;
}
 * ```
 */
export interface IRequest {
  headers: IRequestHeaders;
  user?: IUser;
  params: object;
}

/**
 * ```typescript
 * interface IRequestHeaders {
    authorization: string;
}
 * ```
 * The ``authorization`` string should come in formar ``Bearer [token]``
 */
export interface IRequestHeaders {
  authorization?: string;
}

/**
 * ```typescript
 * interface IUsernameExistsRequestParams {
    username: string;
}
 * ```
 * This interface represents the request parameters that are sent to ``/accounts/username/{username}``
 */
export interface IUsernameExistsRequestParams {
  username: string;
}

/**
 * ```typescript
 * interface IHttpError {
    message: string[];
    statusCode: number;
    error: string;
}
 * ```
 * Interface for errors in the standard form, typically used with the ``HttpFormattedException`` class.
 */

export interface IHttpError {
  message: string[];
  statusCode: number;
  error: string;
}

/**
 * ```typescript
 * interface IUser {
    id: number;
    username: string;
}
 * ```
 * Represents a user object that is used when returning a response to the client for successful authentication.
 */
export interface IUser {
  id: number;
  username: string;
}

/**
 * ```typescript
 * interface ICreatedSession {
    user: IUser;
    token: string;
}
 * ```
 * Represents an object that is returned to the client upon successful authentication. It holds a JWT
 * and the user's ``id`` and ``username``
 */
export interface ICreatedSession {
  user: IUser;
  token: string;
}

/**
 * ```typescript
 * interface ISorter {
    page: number;
    sortBy: sortCategory;
    order: order;
  }
 * ```
 */
export interface ISorter {
  page: number;
  sortBy: sortCategory;
  order: order;
}

export type sortCategory = 'title';
export type order = 'asc' | 'desc';