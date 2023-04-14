import { Injectable, CanActivate, ExecutionContext, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import { IRequest, IUser } from '../../interfaces';
import { extractTokenFromHeader } from '../../util/extractTokenFromHeader/extractTokenFromHeader';
import { HttpFormattedException } from '../../util/HttpFormattedException';
import { invalidActionsMessages } from '../../constants/invalidActionsMessages';
import { InjectRepository } from '@nestjs/typeorm';
import { Deck } from '../../modules/decks/entities/deck.entity';
import { Repository } from 'typeorm';
import { HttpNotFoundException } from '../../util/exceptions/HttpNotFoundException';
import { HttpForbiddenException } from '../../util/exceptions/HttpForbiddenException';

/**
 * This guard blocks requests from users that are the creators of the given deck. This guard only
 * works for requests that have an ``id`` route variable.
 * 
 * **Note:** this guard does not check if a JWT is valid. Use the ``isLoggedInGuard`` to block
 * requests from users with invalid JWTs
 */
@Injectable()
export class IsNotCreatorGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(Deck)
    private readonly deckRepository: Repository<Deck>
  ) { }
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: IRequest = context.switchToHttp().getRequest();
    const bearerToken = req.headers?.authorization;
    const token = extractTokenFromHeader(bearerToken);

    try {
      const user: IUser = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });
  
      const id = req.params['id'];
  
      const deck = await this.deckRepository.findOne({
        where: {
          id,
          isDeleted: false,
        },
      });
  
      if (!deck) {
        throw new HttpNotFoundException(invalidActionsMessages.deckDoesNotExist);
      }
  
      if (deck.authorId === user.id) {
        throw new HttpForbiddenException(invalidActionsMessages.isCreator);
      }

    } catch (err: any) {
      if (err instanceof HttpFormattedException) {
        throw err;
      }
    }

    return true;
  }
}