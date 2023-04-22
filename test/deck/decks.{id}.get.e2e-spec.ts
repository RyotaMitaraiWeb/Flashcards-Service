import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { IAuthBody, IDeckSubmissionFailure } from '../util/interfaces';
import { TypeOrmSQLITETestingModule } from '../util/memoryDatabase';
import { invalidActionsMessages } from '../../src/constants/invalidActionsMessages';
import { validationRules } from '../../src/constants/validationRules';
import { AccountsModule } from '../../src/modules/accounts/accounts.module';
import { BookmarksModule } from '../../src/modules/bookmarks/bookmarks.module';
import { DecksModule } from '../../src/modules/decks/decks.module';
import { classValidatorContainer } from '../util/classValidatorContainer';
import { createDeck, createDeckSeed, registerSeed } from '../util/seeds';
import { IHttpError, IUser } from '../../src/interfaces';
import { GetDeckDto } from '../../src/modules/decks/dto/get-deck.dto';

describe('/decks/{id} (GET)', () => {
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
  let id: number = 0;

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

    const deckResult = await createDeckSeed(app, token, deckSubmission);
    id = deckResult.id;
  });

  it('Retrieves a deck successfully (logged out => no bookmark)', async () => {
    const result = await request(server)
      .get(getDeckEndpoint(id))
      .expect(HttpStatus.OK);

    const res: GetDeckDto = result.body;
    const createdAt = res.createdAt;
    const updatedAt = res.updatedAt;
    expect(res).toEqual<GetDeckDto>({
      id,
      title: deckSubmission.title,
      description: deckSubmission.description,
      authorId: user.id,
      flashcards: deckSubmission.flashcards,
      bookmarked: false,
      createdAt,
      updatedAt,
    });
  });

  it('Retrieves a bookmarked deck successfully', async () => {
    const register2 = await registerSeed(app, 'e');

    let token2 = '';

    token2 = `Bearer ${register2.token}`;

    await request(server)
      .post('/bookmarks/' + id)
      .set('Authorization', token2);

    const result = await request(server)
      .get(getDeckEndpoint(id))
      .set('Authorization', token2)
      .expect(HttpStatus.OK);

    const deck: GetDeckDto = result.body;
    const createdAt = deck.createdAt;
    const updatedAt = deck.updatedAt;

    expect(deck).toEqual<GetDeckDto>({
      id,
      title: deckSubmission.title,
      description: deckSubmission.description,
      authorId: user.id,
      flashcards: deckSubmission.flashcards,
      bookmarked: true,
      createdAt,
      updatedAt,
    });
  });

  it('Retrieves a non-bookmarked deck successfully (logged in => no bookmark)', async () => {
    const registerBody2: IAuthBody = {
      username: 'b'.repeat(validationRules.account.username.minLength),
      password: 'b'.repeat(validationRules.account.password.minLength),
    };

    let token2 = '';

    const register = await request(server)
      .post('/accounts/register')
      .send(registerBody2);

    token2 = `Bearer ${register.body.token}`;

    const result = await request(server)
      .get(getDeckEndpoint(id))
      .set('Authorization', token2)
      .expect(HttpStatus.OK);

    const deck: GetDeckDto = result.body;
    const createdAt = deck.createdAt;
    const updatedAt = deck.updatedAt;

    expect(deck).toEqual<GetDeckDto>({
      id,
      title: deckSubmission.title,
      description: deckSubmission.description,
      authorId: user.id,
      flashcards: deckSubmission.flashcards,
      bookmarked: false,
      createdAt,
      updatedAt,
    });
  });

  it('Returns 404 for a non-existant deck', async () => {
    const result = await request(server)
      .get(getDeckEndpoint(0))
      .expect(HttpStatus.NOT_FOUND);

    const res: IDeckSubmissionFailure = result.body;

    expect(res).toEqual<IDeckSubmissionFailure>({
      message: [invalidActionsMessages.deckDoesNotExist],
      error: 'Not Found',
      statusCode: HttpStatus.NOT_FOUND,
    });
  });

  it('Returns 404 if the deck is deleted', async () => {
    await request(server)
      .del(getDeckEndpoint(id))
      .set('Authorization', token);

    const result = await request(server)
      .get(getDeckEndpoint(id))
      .expect(HttpStatus.NOT_FOUND);

    const errors: IHttpError = result.body;
    expect(errors.message.includes(invalidActionsMessages.deckDoesNotExist)).toBe(true);
  });

  afterEach(async () => {
    await app.close();
  });
});