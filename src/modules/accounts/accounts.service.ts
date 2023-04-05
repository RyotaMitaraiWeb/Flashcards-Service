import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegisterDto } from './dto/register-dto';
import { UserDto } from './dto/user-dto';
import { Account } from './entities/account.entity';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login-dto';
import { HttpFormattedException } from '../../util/HttpFormattedException';
import { invalidActionsMessages } from '../../constants/invalidActionsMessages';
import { extractTokenFromHeader } from '../../util/extractTokenFromHeader/extractTokenFromHeader';
import { jwtBlacklist } from './jwtBlacklist';
import { ICreatedSession, IUser } from '../../interfaces';

@Injectable()
export class AccountsService {

  constructor(
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    private readonly jwtService: JwtService,
  ) { }
  /**
   * Creates an account for the user or throws an error if the registration is invalid
   * @param registerDto - the body of the register request
   * @returns a Promise that resolves to ``UserDto``
   */
  async register(registerDto: RegisterDto): Promise<UserDto> {
    const account = new Account();
    account.username = registerDto.username;
    
    const password = await bcrypt.hash(registerDto.password, Number(process.env.SALT_ROUNDS));
    account.password = password;

    const result = await this.accountRepository.save(account);

    const user = new UserDto();
    user.id = result.id;
    user.username = result.username;

    return user;
  }

  /**
   * Generates a ``UserDto`` if provided with correct credentials or throws an error.
   * @param loginDto the credentials of the given request
   * @returns a Promise that resolves to a UserDto if the login is successful.
   */
  async login(loginDto: LoginDto): Promise<UserDto> {
    const { username, password } = loginDto;
    try {
      const account = await this.findUserByUsernameOrThrow(username);
      await this.checkIfPasswordMatchesOrThrow(account, password);

      const userDto = new UserDto();
      userDto.id = account.id;
      userDto.username = account.username;

      return userDto;
    } catch (err: any) {
      throw new HttpFormattedException({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: [invalidActionsMessages.failedLogin],
        error: 'Unauthorized',
      }, HttpStatus.UNAUTHORIZED);
    }
  }

  /**
   * Adds the provided JWT to the ``jwtBlacklist``. This makes the token unusable for authorized
   * requests.
   * @param bearerToken a JWT in the format ``Bearer [token]``
   */
  logout(bearerToken: string) {
    const jwt = extractTokenFromHeader(bearerToken);
    jwtBlacklist.add(jwt);
  }

  /**
   * Checks if an account with the given username exists. **Note:** the Account entity class checks
   * if a username exists when creating an account. This method is intended to be used for client-side
   * validation.
   * @param username the username to be searched
   * @returns a Promise that resolves to ``true`` if the username exists or ``false``
   * if the username does not exist
   */
  async checkIfUsernameExists(username: string): Promise<boolean> {
    const user = await this.accountRepository.findOneBy({ username });
    return user !== null;
  }

  /**
   * Generates a JWT of the user.
   * @param userDto - the user to be used for token generation
   * @returns a Promise that resolves to the token. The token contains the user's ``username`` and ``id``
   */
  async generateToken(userDto: UserDto): Promise<string> {
    const user = {
      username: userDto.username,
      id: userDto.id,
    };

    const token = await this.jwtService.signAsync(user, {
      secret: process.env.JWT_SECRET,
      expiresIn: '7d',
    });

    return token;
  }

  async generateUserFromJWT(bearerToken: string): Promise<ICreatedSession> {
    const token = extractTokenFromHeader(bearerToken);
    const user: IUser = await this.jwtService.verifyAsync(token, {
      secret: process.env.JWT_SECRET,
    });
    
    return { user, token };
  }

  /**
   * Searches the database for a user with the given username and returns that user.
   * Throws an error if no such user exists.
   * @param username 
   * @returns a Promise that resolves to the user's ``Account``
   */
  private async findUserByUsernameOrThrow(username: string): Promise<Account> {
    const user = await this.accountRepository.findOneBy({ username });
    if (!user) {
      throw new Error('User does not exist');
    }

    return user;
  }

  /**
   * Compares the given input to the user's hashed password. Throws an error if the passwords
   * do not match.
   * @param user an ``Account`` entity
   * @param password the input to be compared to the given ``user``'s hashed password
   */
  private async checkIfPasswordMatchesOrThrow(user: Account, password: string) {
    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      throw new Error('Password does not exist');
    }
  }
}
