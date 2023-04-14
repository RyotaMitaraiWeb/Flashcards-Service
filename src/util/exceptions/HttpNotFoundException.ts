import { HttpStatus } from '@nestjs/common';
import { HttpFormattedException } from '../HttpFormattedException';

export class HttpNotFoundException extends HttpFormattedException {
  constructor(...message: string[]) {
    super({
      error: 'Not Found',
      message,
      statusCode: HttpStatus.NOT_FOUND,
    }, HttpStatus.NOT_FOUND);
  }
}