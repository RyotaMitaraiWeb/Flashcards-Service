import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmSQLITETestingModule } from '../util/memoryDatabase';
import { invalidActionsMessages } from '../../src/constants/invalidActionsMessages';
import { validationRules } from '../../src/constants/validationRules';
import { AccountsModule } from '../../src/modules/accounts/accounts.module';
import { BookmarksModule } from '../../src/modules/bookmarks/bookmarks.module';
import { DecksModule } from '../../src/modules/decks/decks.module';
import { classValidatorContainer } from '../util/classValidatorContainer';
import { createDeck, createDeckMultipleSeeds, createDeckSeed, registerSeed } from '../util/seeds';
import { IUser, IHttpError } from '../../src/interfaces';
import { AllDecksDto } from '../../src/modules/decks/dto/all-decks-dto';
import { IDeckSubmissionSuccess } from '../util/interfaces';

describe('/decks/own (GET)', () => {
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
  let id1 = 0;

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

    const deckResult = await createDeckSeed(app, token, deckSubmission)
    id1 = deckResult.id;

    let token2: string = '';
    const submission = createDeck('a');

    let id2: number = 0;

    const registerResult = await registerSeed(app, 'x');

    token2 = `Bearer ${registerResult.token}`;

    const deckResult2 = await createDeckSeed(app, token2, submission);
    id2 = deckResult2.id;
  });

  it('Returns 401 if the user is not logged in', async () => {
    const result = await request(server)
      .get(getDeckEndpoint('own'))
      .expect(HttpStatus.UNAUTHORIZED);

    const res: IHttpError = result.body;
    expect(res.message.includes(invalidActionsMessages.isNotLoggedIn)).toBe(true);
  });

  it('Returns an empty array if the user does not have any decks', async () => {
    await request(server)
      .del(getDeckEndpoint(id1))
      .set('Authorization', token);

    const result = await request(server)
      .get(getDeckEndpoint('own'))
      .set('Authorization', token)
      .expect(HttpStatus.OK);

    const res: AllDecksDto[] = result.body;
    expect(res).toEqual([]);
  });

  it('Returns by page', async () => {
    await createDeckMultipleSeeds(app, token, deckSubmission, validationRules.deck.search.limit);

    const result = await request(server)
      .get(getDeckEndpoint('own?page=2'))
      .set('Authorization', token)
      .expect(HttpStatus.OK);

    const res: AllDecksDto[] = result.body;
    expect(res.length).toBe(1);
  });

  it('Sorts by title ascending', async () => {
    await createDeckMultipleSeeds(app, token, deckSubmission, validationRules.deck.search.limit);

    const result = await request(server)
      .get(getDeckEndpoint('own?sortBy=title&order=asc&page=2'))
      .set('Authorization', token)
      .expect(HttpStatus.OK);

    const decks: AllDecksDto[] = result.body;
    const sortedDecks = [...decks].sort((a, b) => a.title.localeCompare(b.title) || a.id - b.id);

    expect(decks).toEqual(sortedDecks);
  });

  it('Sorts by title descending', async () => {
    await createDeckMultipleSeeds(app, token, deckSubmission, validationRules.deck.search.limit);

    const result = await request(server)
      .get(getDeckEndpoint('own?sortBy=title&order=desc'))
      .set('Authorization', token)
      .expect(HttpStatus.OK);

    const decks: AllDecksDto[] = result.body;
    const sortedDecks = [...decks].sort((a, b) => b.title.localeCompare(a.title) || a.id - b.id);
    expect(decks).toEqual(sortedDecks);
  });

  afterEach(async () => {
    await app.close();
  });
});