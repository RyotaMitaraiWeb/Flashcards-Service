/**
 * ```typescript
 * interface IRequest {
    headers?: IRequestHeaders;
}
 * ```
 */
export interface IRequest {
  headers?: IRequestHeaders;
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
  authorization: string;
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