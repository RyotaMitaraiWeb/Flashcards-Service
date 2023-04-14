import { HttpStatus } from '@nestjs/common';
import { HttpFormattedException } from '../HttpFormattedException';

export class HttpUnauthorizedException extends HttpFormattedException {
  constructor(...message: string[]) {
    super({
      error: 'Unauthorized',
      message,
      statusCode: HttpStatus.UNAUTHORIZED,
    }, HttpStatus.UNAUTHORIZED);
  }
}