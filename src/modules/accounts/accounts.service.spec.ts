import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccountsService } from './accounts.service';
import { RegisterDto } from './dto/register-dto';
import { UserDto } from './dto/user-dto';
import { Account } from './entities/account.entity';
import { JwtService } from '@nestjs/jwt';
import { validate } from 'class-validator';

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
});
