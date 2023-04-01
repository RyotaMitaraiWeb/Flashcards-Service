import { HttpException } from '@nestjs/common';
import { IHttpError } from '../interfaces';

/**
 * This exception should be thrown when you need the response to be in the following format:
 * ```typescript
 * {
 *  "errorCode": number,
 *  "message": string[],
 *  "error": string
 * }
 * ```
 */
export class HttpFormattedException extends HttpException {
  /**
   * @param error the error response object to be given to the user
   * @param response the status code of the error
   */
  constructor(error: IHttpError, response: number) {
    super(error, response)
  }
}