import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmSQLITETestingModule } from './util/memoryDatabase';
import { AccountsModule } from '../src/modules/accounts/accounts.module';
import { AccountsController } from '../src/modules/accounts/accounts.controller';
import { AccountsService } from '../src/modules/accounts/accounts.service';
import { IAuthBody, IAuthErrorResponse } from './util/interfaces';
import { JwtService } from '@nestjs/jwt';
import { validationMessages } from '../src/constants/validationMessages';
import { UniqueUsernameValidator } from '../src/custom-validators/uniqueUsername';
import { useContainer } from 'class-validator';
import { invalidActionsMessages } from '../src/constants/invalidActionsMessages';
import { ICreatedSession, IUser } from '../src/interfaces';
import { jwtBlacklist } from '../src/modules/accounts/jwtBlacklist';
import { BookmarksModule } from '../src/modules/bookmarks/bookmarks.module';
import { DecksModule } from '../src/modules/decks/decks.module';
import { classValidatorContainer } from './util/classValidatorContainer';
import { registerSeed } from './util/seeds';

describe('Account controller (E2E)', () => {
  let app: INestApplication;
  let server: any;

  let registerEndpoint = '/accounts/register';
  let loginEndpoint = '/accounts/login';
  let logoutEndpoint = '/accounts/logout';
  let sessionEndpoint = '/accounts/session';
  let usernameExistsEndpoint = '/accounts/username';

  process.env.JWT_SECRET = 'wehmwopehnwpeoinw';

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmSQLITETestingModule(), AccountsModule, BookmarksModule, DecksModule],
      controllers: [AccountsController],
      providers: [
        AccountsService,
        JwtService,
        UniqueUsernameValidator,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    classValidatorContainer(app);
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

      const result: ICreatedSession = res.body;
      expect(typeof result.token).toBe('string');
      expect(result.user).toEqual({ id: 1, username: body.username });
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

      const res: ICreatedSession = register.body;
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
    const credentials: IAuthBody = {
      username: 'ryota1',
      password: '123456',
    };

    let token = '';

    beforeEach(async () => {
      const result = await request(server)
        .post(registerEndpoint)
        .send(credentials);

      const body: ICreatedSession = result.body;
      token = `Bearer ${body.token}`;
    });

    it('logs in successfully', async () => {
      const res = await request(server)
        .post(loginEndpoint)
        .send(credentials)
        .expect(HttpStatus.CREATED);

      const body: ICreatedSession = res.body;
      const jwt = body.token;
      expect(typeof jwt).toBe('string');
      expect(body.user).toEqual({ id: 1, username: credentials.username });
    });

    it('Returns 403 if a token is detected in the Authorization header', async () => {
      const result = await request(server)
        .post(loginEndpoint)
        .send(credentials)
        .set('Authorization', token)
        .expect(HttpStatus.FORBIDDEN);

      const res: IAuthErrorResponse = result.body;
      expect(res.message.includes(invalidActionsMessages.isNotLoggedOut)).toBe(true);
    });

    it('Returns 401 for wrong password', async () => {
      const wrongPasswordBody: IAuthBody = {
        username: 'ryota1',
        password: '1',
      };

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

  describe('/logout (DELETE)', () => {
    let token = '';

    beforeEach(async () => {
      const register = await registerSeed(app, 'a');
      token = `Bearer ${register.token}`;
    });

    it('Returns 204 for successful logout', async () => {
      await request(server)
        .del(logoutEndpoint)
        .set('Authorization', token)
        .expect(HttpStatus.NO_CONTENT);
    });

    it('Returns 401 if a valid JWT is not provided', async () => {
      const result = await request(server)
        .del(logoutEndpoint)
        .expect(HttpStatus.UNAUTHORIZED);

      const res: IAuthErrorResponse = result.body;
      expect(res.message.includes(invalidActionsMessages.isNotLoggedIn)).toBe(true);
    });

    it('Returns 401 if the JWT is blacklisted', async () => {
      await request(server)
        .del(logoutEndpoint)
        .set('Authorization', token);

      const result = await request(server)
        .del(logoutEndpoint)
        .set('Authorization', token)
        .expect(HttpStatus.UNAUTHORIZED);

      const res: IAuthErrorResponse = result.body;
      expect(res.message.includes(invalidActionsMessages.isNotLoggedIn)).toBe(true);
    });
  });

  describe('/session (POST)', () => {
    let token: string = '';

    let user: IUser = {
      id: 0,
      username: '',
    };

    beforeEach(async () => {
      const result = await registerSeed(app, 'a');

      token = `Bearer ${result.token}`;
      user = result.user;
    });

    it('Returns 201 for a valid session', async () => {
      const result = await request(server)
        .post(sessionEndpoint)
        .set('Authorization', token)
        .expect(HttpStatus.CREATED);

      const res: ICreatedSession = result.body;

      const expectedToken = token.replace('Bearer ', '');
      expect(res.token).toBe(expectedToken);
      expect(res.user.id).toBe(user.id);
      expect(res.user.username).toBe(user.username);
    });

    it('Returns 401 for an invalid session', async () => {
      const result = await request(server)
        .post(sessionEndpoint)
        .expect(HttpStatus.UNAUTHORIZED);

      const errors: IAuthErrorResponse = result.body;
      expect(errors.message.includes(invalidActionsMessages.isNotLoggedIn)).toBe(true);
    });
  });

  describe('/username/{username} (GET)', () => {
    let registerBody: IAuthBody = {
      username: 'ryota1',
      password: '123456',
    };

    beforeEach(async () => {
      await request(server)
        .post(registerEndpoint)
        .send(registerBody);
    });

    it('Returns 200 for an existing username', async () => {
      const result = await request(server)
        .get(`${usernameExistsEndpoint}/${registerBody.username}`)
        .expect(HttpStatus.OK);

      const res = result.body;
      expect(res).toEqual({});
    });

    it('Returns 404 for a non-existant username', async () => {
      const result = await request(server)
        .get(`${usernameExistsEndpoint}/a`)
        .expect(HttpStatus.NOT_FOUND);

      const res = result.body;
      expect(res).toEqual({});
    });
  });

  afterEach(async () => {
    await app.close();
    jwtBlacklist.clear();
  });
});