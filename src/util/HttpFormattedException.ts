import { HttpException } from '@nestjs/common';
import { IHttpError } from '../interfaces';

/**
 * This exception is a base exception which other exceptions can inherit 
 * when you need the response to be in the following format:
 * ```typescript
 * {
 *  "errorCode": number,
 *  "message": string[],
 *  "error": string
 * }
 * ```
 */
export abstract class HttpFormattedException extends HttpException {
  /**
   * @param error the error response object to be given to the user
   * @param response the status code of the error
   */
  constructor(error: IHttpError, response: number) {
    super(error, response)
  }
}