import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmSQLITETestingModule } from './util/memoryDatabase';
import { AccountsModule } from '../src/modules/accounts/accounts.module';
import { AccountsController } from '../src/modules/accounts/accounts.controller';
import { AccountsService } from '../src/modules/accounts/accounts.service';
import { IAuthBody, IAuthErrorResponse, IAuthSuccessResponse } from './util/interfaces';
import { JwtService } from '@nestjs/jwt';
import { validationMessages } from '../src/constants/validationMessages';
import { UniqueUsernameValidator } from '../src/custom-validators/uniqueUsername';
import { useContainer } from 'class-validator';
import { invalidActionsMessages } from '../src/constants/invalidActionsMessages';

describe('Account controller (E2E)', () => {
  let app: INestApplication;
  let server: any;

  let registerEndpoint = '/accounts/register';
  let loginEndpoint = '/accounts/login';

  process.env.JWT_SECRET = 'wehmwopehnwpeoinw';

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmSQLITETestingModule(), AccountsModule],
      controllers: [AccountsController],
      providers: [
        AccountsService,
        JwtService,
        UniqueUsernameValidator,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    useContainer(app.select(AccountsModule), { fallbackOnErrors: true });
    app.useGlobalPipes(new ValidationPipe());

    await app.init();

    server = app.getHttpServer();

  });

  describe('/register (POST)', () => {
    it('Registers successfully', async () => {
      const body: IAuthBody = {
        username: 'abcde',
        password: '123456',
      };

      const res = await request(server)
        .post(registerEndpoint)
        .send(body)
        .expect(HttpStatus.CREATED);
      
      const result: IAuthSuccessResponse = res.body;
      expect(typeof result.token).toBe('string');
    });

    it('Fails to register when the username is too short', async () => {
      const body: IAuthBody = {
        username: 'a',
        password: '123456'
      };

      const res = await request(server)
        .post(registerEndpoint)
        .send(body)
        .expect(HttpStatus.BAD_REQUEST);
      
      const result: IAuthErrorResponse = res.body;
      expect(result.message).toEqual([validationMessages.account.username.isTooShort]);
    });

    it('Fails to register when the username is too long', async () => {
      const body: IAuthBody = {
        username: 'a'.repeat(16),
        password: '123456'
      };

      const res = await request(server)
        .post(registerEndpoint)
        .send(body)
        .expect(HttpStatus.BAD_REQUEST);
      
      const result: IAuthErrorResponse = res.body;
      expect(result.message).toEqual([validationMessages.account.username.isTooLong]);
    });

    it('Fails to register when the username is not alphanumeric', async () => {
      const body: IAuthBody = {
        username: 'abcde!',
        password: '123456'
      };

      const res = await request(server)
        .post(registerEndpoint)
        .send(body)
        .expect(HttpStatus.BAD_REQUEST);
      
      const result: IAuthErrorResponse = res.body;
      expect(result.message).toEqual([validationMessages.account.username.isNotAlphanumeric]);
    });

    it('Fails to register when the password is too short', async () => {
      const body: IAuthBody = {
        username: 'abcde',
        password: '1'
      };

      const res = await request(server)
        .post(registerEndpoint)
        .send(body)
        .expect(HttpStatus.BAD_REQUEST);
      
      const result: IAuthErrorResponse = res.body;
      expect(result.message).toEqual([validationMessages.account.password.isTooShort]);
    });

    it('Fails to register if the username is not a string', async () => {
      const body = {
        username: 1,
        password: '123456'
      };

      const res = await request(server)
        .post(registerEndpoint)
        .send(body)
        .expect(HttpStatus.BAD_REQUEST);
      
      const result: IAuthErrorResponse = res.body;
      expect(result.message.includes(validationMessages.account.username.isNotString)).toBe(true);
    });

    it('Fails to register if the password is not a string', async () => {
      const body = {
        username: 'abcde',
        password: 1,
      };

      const res = await request(server)
        .post(registerEndpoint)
        .send(body)
        .expect(HttpStatus.BAD_REQUEST);
      
      const result: IAuthErrorResponse = res.body;
      expect(result.message.includes(validationMessages.account.password.isNotString)).toBe(true);
    });

    it('Returns bad request when the username property is missing', async () => {
      const body = {
        username: 'abcde',
      };

      const res = await request(server)
        .post(registerEndpoint)
        .send(body)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('Fails to register when the username is already taken', async () => {
      const body: IAuthBody = {
        username: 'ryota1',
        password: '123456',
      };

      await request(server)
        .post(registerEndpoint)
        .send(body);

      const res = await request(server)
        .post(registerEndpoint)
        .send(body)
        .expect(HttpStatus.BAD_REQUEST);

        const result: IAuthErrorResponse = res.body;
        expect(result.message.includes(validationMessages.account.username.alreadyExists)).toBe(true);
    });

    it('Returns bad request when the password property is missing', async () => {
      const body = {
        password: '123456',
      };

      const res = await request(server)
        .post(registerEndpoint)
        .send(body)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('Returns multiple error messages when there are more than one validation errors', async () => {
      const body: IAuthBody = {
        username: 'a!',
        password: '1'
      };

      const res = await request(server)
        .post(registerEndpoint)
        .send(body)
        .expect(HttpStatus.BAD_REQUEST);
      
      const result: IAuthErrorResponse = res.body;
      expect(result.message.length).toBe(3);
      expect(result.message.includes(validationMessages.account.username.isTooShort)).toBe(true);
      expect(result.message.includes(validationMessages.account.username.isNotAlphanumeric)).toBe(true);
      expect(result.message.includes(validationMessages.account.password.isTooShort)).toBe(true);
    });

    it('Returns 403 if the request is sent with a valid JWT token', async () => {
      const body: IAuthBody = {
        username: 'ryota1',
        password: '123456',
      };

      const register = await request(server)
        .post(registerEndpoint)
        .send(body)

      const res: IAuthSuccessResponse = register.body;
      const token = res.token;

      const failedRegister = await request(server)
        .post(registerEndpoint)
        .send(body)
        .set({
          'Authorization': `Bearer ${token}`,
        })
        .expect(HttpStatus.FORBIDDEN);

      const errorRes: IAuthErrorResponse = failedRegister.body;
      expect(errorRes.message.includes(invalidActionsMessages.isNotLoggedOut)).toBe(true);
    });
  });

  describe('/login (POST)', () => {
    it('logs in successfully', async () => {
      const credentials: IAuthBody = {
        username: 'ryota1',
        password: '123456',
      };

      const result = await request(server)
      .post(registerEndpoint)
      .send(credentials);

      const res = await request(server)
        .post(loginEndpoint)
        .send(credentials)
        .expect(HttpStatus.CREATED);

      const body: IAuthSuccessResponse = res.body;
      const jwt = body.token;
      expect(typeof jwt).toBe('string');
    });

    it('Returns 403 if a token is detected in the Authorization header', async () => {
      const credentials: IAuthBody = {
        username: 'ryota1',
        password: '123456',
      };

      const register = await request(server)
        .post(registerEndpoint)
        .send(credentials);

      const registerRes: IAuthSuccessResponse = register.body;
      const token = `Bearer ${registerRes.token}`;
      
      const result = await request(server)
        .post(loginEndpoint)
        .send(credentials)
        .set('Authorization', token)
        .expect(HttpStatus.FORBIDDEN);

      const res: IAuthErrorResponse = result.body;
      expect(res.message.includes(invalidActionsMessages.isNotLoggedOut)).toBe(true);
    });

    it('Returns 401 for wrong password', async () => {
      const credentials: IAuthBody = {
        username: 'ryota1',
        password: '123456',
      };
  
      const wrongPasswordBody: IAuthBody = {
        username: 'ryota1',
        password: '1',
      };
  
      await request(server)
        .post(registerEndpoint)
        .send(credentials);
  
      const result = await request(server)
        .post(loginEndpoint)
        .send(wrongPasswordBody)
        .expect(HttpStatus.UNAUTHORIZED)
  
      const res: IAuthErrorResponse = result.body;
      expect(res.message.includes(invalidActionsMessages.failedLogin)).toBe(true);
    });
  
    it('Returns 401 for non-existant username', async () => {
      const nonExistantUserBody: IAuthBody = {
        username: '1',
        password: '123456',
      };
  
      const result = await request(server)
        .post(loginEndpoint)
        .send(nonExistantUserBody)
        .expect(HttpStatus.UNAUTHORIZED)
  
      const res: IAuthErrorResponse = result.body;
      expect(res.message.includes(invalidActionsMessages.failedLogin)).toBe(true);
    });
  });

  afterEach(async () => {
    await app.close();
  });
});