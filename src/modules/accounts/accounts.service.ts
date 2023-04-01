import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegisterDto } from './dto/register-dto';
import { UserDto } from './dto/user-dto';
import { Account } from './entities/account.entity';
import * as bcrypt from 'bcrypt';

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
}
