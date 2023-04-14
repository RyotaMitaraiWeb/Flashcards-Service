import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccountsService } from './accounts.service';
import { RegisterDto } from './dto/register-dto';
import { UserDto } from './dto/user-dto';
import { Account } from './entities/account.entity';
import { JwtService } from '@nestjs/jwt';
import { validate } from 'class-validator';
import { LoginDto } from './dto/login-dto';
import * as bcrypt from 'bcrypt';
import { HttpFormattedException } from '../../util/HttpFormattedException';
import * as extractTokenFromHeader from '../../util/extractTokenFromHeader/extractTokenFromHeader';
import { jwtBlacklist } from './jwtBlacklist';
import { ICreatedSession, IUser } from '../../interfaces';
import { HttpNotFoundException } from '../../util/exceptions/HttpNotFoundException';
import { HttpUnauthorizedException } from '../../util/exceptions/HttpUnauthorizedException';

describe('AccountsService', () => {
  let service: AccountsService;
  let repository: Repository<Account>;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtService,
        AccountsService,
        {
          provide: getRepositoryToken(Account),
          useClass: Repository,
        }],
    }).compile();

    service = module.get<AccountsService>(AccountsService);
    jwtService = module.get<JwtService>(JwtService);
    repository = module.get<Repository<Account>>(getRepositoryToken(Account));

  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    beforeEach(() => {
      jest.spyOn(repository, 'findOneBy').mockImplementation(async () => null);
    });

    it('Returns a UserDto when the user is registered successfully', async () => {
      const register = new RegisterDto();
      register.username = 'a';
      register.password = 'b';

      jest.spyOn(repository, 'save').mockImplementation(async () => {
        const account = new Account();
        account.username = register.username;
        account.id = 1;
        return account;
      });

      const result = await service.register(register);

      const user = new UserDto();
      user.username = 'a';
      user.id = 1;
      expect(result).toEqual(user);
    });

    it('Throws an error when the new account cannot be saved to the repository', async () => {
      const register = new RegisterDto();
      register.username = 'a';
      register.password = 'b';

      jest.spyOn(repository, 'save').mockImplementation(async () => {
        const errors = await validate(register);
        if (errors.length > 0) {
          throw new Error();
        }

        return new Account();
      });

      expect(() => service.register(register)).rejects.toThrow();
    });
  });

  describe('generateToken', () => {
    it('generates a JWT successfully', async () => {
      const result = 'a';
      jest.spyOn(jwtService, 'signAsync').mockImplementation(async () => result);

      const user = new UserDto();
      user.id = 1;
      user.username = 'a';

      const token = await service.generateToken(user);

      expect(token).toBe(result);
    });
  });

  describe('login', () => {
    it('Returns a UserDto when the login is successful', async () => {
      const expectedUser = new UserDto();
      expectedUser.id = 1;
      expectedUser.username = 'ryota1';

      jest.spyOn(repository, 'findOneBy').mockImplementation(async () => {
        const account = new Account();
        account.id = expectedUser.id;
        account.username = expectedUser.username;
        account.password = '123456';

        return account;
      });

      jest.spyOn(bcrypt, 'compare').mockImplementation(async () => true);

      const login = new LoginDto();
      login.username = expectedUser.username;
      login.password = '123456';

      const loggedInUser = await service.login(login);
      expect(loggedInUser).toEqual(expectedUser);
    });

    it('Throws an HttpUnauthorizedException if "findOneById" returns null', async () => {
      jest.spyOn(repository, 'findOneById').mockImplementation(async () => null);
      jest.spyOn(bcrypt, 'compare').mockImplementation(async () => true);

      const login = new LoginDto();
      login.username = 'ryota1';
      login.password = '123456';
      expect(() => service.login(login)).rejects.toThrowError(HttpUnauthorizedException);
    });

    it('Throws an HttpUnauthorizedException if bcrypt.compare returns false', async () => {
      jest.spyOn(repository, 'findOneBy').mockImplementation(async () => {
        const account = new Account();
        account.id = 1;
        account.username = 'ryota1';
        account.password = '123456';

        return account;
      });
      jest.spyOn(bcrypt, 'compare').mockImplementation(async () => false);

      const login = new LoginDto();
      login.username = 'ryota1';
      login.password = 'wrongpassword';
      expect(() => service.login(login)).rejects.toThrowError(HttpUnauthorizedException);
    });
  });

  describe('logout', () => {
    it('Adds a token to the blacklist successfully', async () => {
      const mockToken = 'Bearer a';
      const expectedToken = 'a';
      jest.spyOn(extractTokenFromHeader, 'extractTokenFromHeader').mockImplementation(() => expectedToken);
      service.logout(mockToken);
      expect(jwtBlacklist.has(expectedToken)).toBe(true);
    });
  });

  describe('checkSession', () => {
    it('Generates an ICreatedSession object successfully', async () => {
      const expectedUser: ICreatedSession = {
        token: 'a',
        user: {
          id: 1,
          username: 'a',
        },
      };

      jest.spyOn(jwtService, 'verifyAsync').mockImplementation(async () => {
        const user: IUser = { ...expectedUser.user }

        return user;
      });

      jest.spyOn(extractTokenFromHeader, 'extractTokenFromHeader').mockImplementation(() => expectedUser.token);

      const user = await service.generateUserFromJWT('Bearer a');
      
      expect(user).toEqual(expectedUser);
    });
  });

  describe('checkIfUsernameExists', () => {
    it('Returns true when account repository finds the user', async () => {
      jest.spyOn(repository, 'findOneBy').mockImplementation(async () => new Account());

      const exists = await service.checkIfUsernameExists('a');
      expect(exists).toBe(true);
    });

    it('Returns false when account repository returns null', async () => {
      jest.spyOn(repository, 'findOneBy').mockImplementation(async () => null);

      const exists = await service.checkIfUsernameExists('a');
      expect(exists).toBe(false);
    });
  });
});
