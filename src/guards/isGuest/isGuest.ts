import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import { validationMessages } from '../../constants/validationMessages';
import { IRequest } from '../../interfaces';
import { extractTokenFromHeader } from '../../util/extractTokenFromHeader/extractTokenFromHeader';
import { HttpFormattedException } from '../../util/HttpFormattedException';
import { invalidActionsMessages } from '../../constants/invalidActionsMessages';
import { jwtBlacklist } from '../../modules/accounts/jwtBlacklist';
import { HttpForbiddenException } from '../../util/exceptions/HttpForbiddenException';

/**
 * This guard blocks requests that provide a valid JWT in the ``Authorization`` header
 */
@Injectable()
export class IsGuestGuard implements CanActivate {
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
      
    } catch {
      return true;
    }

    throw new HttpForbiddenException(invalidActionsMessages.isNotLoggedOut)
  }

}