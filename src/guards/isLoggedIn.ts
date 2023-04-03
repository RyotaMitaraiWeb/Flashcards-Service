import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import { IRequest } from '../interfaces';
import { extractTokenFromHeader } from '../util/extractTokenFromHeader/extractTokenFromHeader';
import { HttpFormattedException } from '../util/HttpFormattedException';
import { invalidActionsMessages } from '../constants/invalidActionsMessages';
import { jwtBlacklist } from '../modules/accounts/jwtBlacklist';

/**
 * This guard blocks requests that do not provide a valid JWT in the ``Authorization`` header
 */
@Injectable()
export class IsLoggedInGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) { }
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const req: IRequest = context.switchToHttp().getRequest();
    const bearerToken = req.headers?.authorization;
    const token = extractTokenFromHeader(bearerToken);

    try {
      if (!token || jwtBlacklist.has(token)) {
        throw new Error();
      }

      this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });

      return true;
    } catch (err: any) {
      throw new HttpFormattedException({
        error: 'Unauthorized',
        statusCode: HttpStatus.UNAUTHORIZED,
        message: [invalidActionsMessages.isNotLoggedIn]
      }, HttpStatus.UNAUTHORIZED);
    }
  }

}