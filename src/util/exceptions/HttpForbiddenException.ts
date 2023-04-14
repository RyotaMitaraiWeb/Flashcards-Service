import { HttpStatus } from '@nestjs/common';
import { HttpFormattedException } from '../HttpFormattedException';

export class HttpForbiddenException extends HttpFormattedException {
  constructor(...message: string[]) {
    super({
      error: 'Forbidden',
      message,
      statusCode: HttpStatus.FORBIDDEN,
    }, HttpStatus.FORBIDDEN);
  }
}