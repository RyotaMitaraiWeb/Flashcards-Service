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
import { IRequestHeaders } from '../../interfaces';

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

  describe('/register (POST)', () => {
    it('Returns a token for successful registration', async () => {
      jest.spyOn(service, 'register').mockImplementation(async () => new UserDto());
      jest.spyOn(service, 'generateToken').mockImplementation(async () => 'a');

      const result = await controller.register(new RegisterDto());
      expect(result.token).toBe('a');
    });

    it('Throws an error if registration throws an error', async () => {
      jest.spyOn(service, 'register').mockImplementation(async () => { throw new Error() });

      expect(() => controller.register(new RegisterDto())).rejects.toThrow();
    });
  });

  describe('/login (POST)', () => {
    it('Returns a token for a successful login', async () => {
      jest.spyOn(service, 'login').mockImplementation(async () => new UserDto());
      jest.spyOn(service, 'generateToken').mockImplementation(async () => 'a');

      const result = await controller.login(new LoginDto());
      expect(result.token).toBe('a');
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
});
