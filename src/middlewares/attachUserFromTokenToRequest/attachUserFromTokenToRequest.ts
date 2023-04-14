import { Injectable, NestMiddleware } from '@nestjs/common';
import { IRequest, IUser } from '../../interfaces';
import { NextFunction } from 'express';
import { extractTokenFromHeader } from '../../util/extractTokenFromHeader/extractTokenFromHeader';
import { JwtService } from '@nestjs/jwt';
import { jwtBlacklist } from '../../modules/accounts/jwtBlacklist';

/**
 * Attaches an ``IUser`` object to the request for any valid JWTs in the ``Authorization`` header
 * or ``null`` if the JWT is invalid.
 * 
 * **Note:** this middleware does not check if a JWT is blacklisted. To prevent unauthorized access
 * from invalid JWTs, use the ``IsLoggedIn`` guard.
 */
@Injectable()
export class AttachUserFromTokenToRequestMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService
  ) { }
  async use(req: IRequest, _res: Response, next: NextFunction) {
    const bearerToken = req.headers.authorization;
    const jwt = extractTokenFromHeader(bearerToken);
    
    try {
      if (jwtBlacklist.has(jwt)) {
        throw new Error();
      }
      
      const user: IUser = await this.jwtService.verifyAsync(jwt, {
        secret: process.env.JWT_SECRET
      });

      req.user = user;
    } catch {
      req.user = null;
    }

    next();
  }
}