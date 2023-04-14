import { HttpStatus } from '@nestjs/common';
import { HttpUnauthorizedException } from './HttpUnauthorizedException';
import { HttpForbiddenException } from './HttpForbiddenException';
import { HttpNotFoundException } from './HttpNotFoundException';

interface IError {
  message: string[];
  error: string;
  statusCode: number;
}

describe('test', () => {
  const message1 = 'a';
  const message2 = 'b';

  it('HttpUnauthorizedException does not break', () => {
    try {
      throw new HttpUnauthorizedException(message1, message2);
    } catch (err) {
      const error: IError = err.response;
      expect(error.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      expect(error.message).toEqual([message1, message2]);
      expect(error.error).toBe('Unauthorized');
    }
  });

  it('HttpForbiddenException does not break', () => {
    try {
      throw new HttpForbiddenException(message1, message2);
    } catch (err) {
      const error: IError = err.response;
      expect(error.statusCode).toBe(HttpStatus.FORBIDDEN);
      expect(error.message).toEqual([message1, message2]);
      expect(error.error).toBe('Forbidden');
    }
  });

  it('HttpNotFoundException does not break', () => {
    try {
      throw new HttpNotFoundException(message1, message2);
    } catch (err) {
      const error: IError = err.response;
      expect(error.statusCode).toBe(HttpStatus.NOT_FOUND);
      expect(error.message).toEqual([message1, message2]);
      expect(error.error).toBe('Not Found');
    }
  });
})