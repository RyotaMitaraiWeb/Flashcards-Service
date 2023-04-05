import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccountsController } from './accounts.controller';
import { AccountsService } from './accounts.service';
import { RegisterDto } from './dto/register-dto';
import { UserDto } from './dto/user-dto';
import { Account } from './entities/account.entity';
import { LoginDto } from './dto/login-dto';
import { ICreatedSession, IRequestHeaders, IUsernameExistsRequestParams } from '../../interfaces';
import { HttpException } from '@nestjs/common';

describe('AccountsController', () => {
  let controller: AccountsController;
  let service: AccountsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccountsController],
      providers: [
        AccountsService,
        JwtService,
        {
          provide: getRepositoryToken(Account),
          useClass: Repository,
        }
      ],
    }).compile();

    controller = module.get<AccountsController>(AccountsController);
    service = module.get<AccountsService>(AccountsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('Returns a token for successful registration', async () => {
      const expectedUser = new UserDto();
      expectedUser.id = 1;
      expectedUser.username = 'a';

      jest.spyOn(service, 'register').mockImplementation(async () => {
        const user = new UserDto();
        user.id = expectedUser.id;
        user.username = expectedUser.username;
        return user;
      });

      jest.spyOn(service, 'generateToken').mockImplementation(async () => 'a');

      const result = await controller.register(new RegisterDto());
      expect(result).toEqual({
        token: 'a',
        user: expectedUser,
      });
      
    });

    it('Throws an error if registration throws an error', async () => {
      jest.spyOn(service, 'register').mockImplementation(async () => { throw new Error() });

      expect(() => controller.register(new RegisterDto())).rejects.toThrow();
    });
  });

  describe('login', () => {
    it('Returns a token for a successful login', async () => {
      const expectedUser = new UserDto();
      expectedUser.id = 1;
      expectedUser.username = 'a';

      jest.spyOn(service, 'login').mockImplementation(async () => {
        const user = new UserDto();
        user.id = expectedUser.id;
        user.username = expectedUser.username;
        return user;
      });
      jest.spyOn(service, 'generateToken').mockImplementation(async () => 'a');

      const result = await controller.login(new LoginDto());
      expect(result).toEqual({
        token: 'a',
        user: expectedUser,
      });
    });

    it('Throws an error if login method throws an error', async () => {
      jest.spyOn(service, 'login').mockImplementation(async () => { throw new Error() });

      expect(() => controller.login(new LoginDto())).rejects.toThrow();
    });
  });

  describe('/logout', () => {
    it('Returns an empty object upon a successful blacklist', async () => {
      jest.spyOn(service, 'logout').mockImplementation(() => {});

      const headers: IRequestHeaders = {
        authorization: 'Bearer a',
      };

      const result = controller.logout(headers);
      expect(result).toEqual({});
    });
  });

  describe('checkSession', () => {
    it('Returns an ICreatedSession object when the session is valid', async () => {
      const expectedResult: ICreatedSession = {
        token: 'a',
        user: {
          id: 1,
          username: 'a',
        }
      };
      jest.spyOn(service, 'generateUserFromJWT').mockImplementation(async () => {
        const result: ICreatedSession = {
          token: expectedResult.token,
          user: {
            id: expectedResult.user.id,
            username: expectedResult.user.username,
          }
        };

        return result;
      });

      const headers: IRequestHeaders = {
        authorization: 'Bearer a',
      };

      const result = await controller.checkSession(headers);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('checkIfUsername exists', () => {
    const params: IUsernameExistsRequestParams = {
      username: 'a',
    };

    it('Returns an empty object when the username exists without throwing an error', async () => {
      jest.spyOn(service, 'checkIfUsernameExists').mockImplementation(async () => true);

      const result = await controller.checkIfUsernameExists(params);
      expect(result).toEqual({});
    });

    it('Throws an error if the username does not exist', async () => {
      jest.spyOn(service, 'checkIfUsernameExists').mockImplementation(async () => false);

      expect(() => controller.checkIfUsernameExists(params)).rejects.toThrow(HttpException);
    });
  })
});
