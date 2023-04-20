import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmSQLITETestingModule } from '../util/memoryDatabase';
import { invalidActionsMessages } from '../../src/constants/invalidActionsMessages';
import { AccountsModule } from '../../src/modules/accounts/accounts.module';
import { BookmarksModule } from '../../src/modules/bookmarks/bookmarks.module';
import { DecksModule } from '../../src/modules/decks/decks.module';
import { classValidatorContainer } from '../util/classValidatorContainer';
import { createDeck, createDeckSeed, registerSeed } from '../util/seeds';
import { IHttpError, IUser } from '../../src/interfaces';


describe('/decks/{id} (DELETE)', () => {
  let app: INestApplication;
  let server: any;

  let getDeckEndpoint = (id: string | number) => `/decks/${id}`;

  let token: string = '';
  let user: IUser = {
    id: 0,
    username: '',
  };

  process.env.JWT_SECRET = 'QEIOGNWEIOHNWEWQTYQ';

  const deckSubmission = createDeck('a');

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AccountsModule, BookmarksModule, DecksModule, ...TypeOrmSQLITETestingModule()],
    }).compile();

    app = moduleFixture.createNestApplication();

    classValidatorContainer(app);
    app.useGlobalPipes(new ValidationPipe());

    await app.init();

    server = app.getHttpServer();
    const register = await registerSeed(app, 'b');

    token = `Bearer ${register.token}`;
    user = register.user;
  });


  let token2: string = '';
  let id: number = 0;

  beforeEach(async () => {
    const registerResult = await registerSeed(app, 'l');
    token2 = `Bearer ${registerResult.token}`;

    const deckResult = await createDeckSeed(app, token2, deckSubmission);
    id = deckResult.id;
  });

  it('Successfully deletes a deck', async () => {
    await request(server)
      .del(getDeckEndpoint(id))
      .set('Authorization', token2)
      .expect(HttpStatus.NO_CONTENT);

    await request(server)
      .get(getDeckEndpoint(id))
      .expect(HttpStatus.NOT_FOUND);
  });

  it('Returns 401 if the user is not logged in', async () => {
    const result = await request(server)
      .del(getDeckEndpoint(id))
      .expect(HttpStatus.UNAUTHORIZED);

    const res: IHttpError = result.body;
    expect(res.message.includes(invalidActionsMessages.isNotLoggedIn)).toBe(true);
  });

  it('Returns 403 if the user is not the creator of the deck', async () => {
    const result = await request(server)
      .del(getDeckEndpoint(id))
      .set('Authorization', token)
      .expect(HttpStatus.FORBIDDEN);

    const res: IHttpError = result.body;
    expect(res.message.includes(invalidActionsMessages.isNotCreator)).toBe(true);
  });

  it('Returns 404 if the deck does not exist', async () => {
    const result = await request(server)
      .del(getDeckEndpoint(0))
      .set('Authorization', token)
      .expect(HttpStatus.NOT_FOUND);

    const res: IHttpError = result.body;
    expect(res.message.includes(invalidActionsMessages.deckDoesNotExist)).toBe(true);
  });

  afterEach(async () => {
    await app.close();
  });
});