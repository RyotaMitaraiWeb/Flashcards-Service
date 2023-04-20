import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { IDeckSubmissionSuccess } from '../util/interfaces';
import { TypeOrmSQLITETestingModule } from '../util/memoryDatabase';
import { validationRules } from '../../src/constants/validationRules';
import { AccountsModule } from '../../src/modules/accounts/accounts.module';
import { BookmarksModule } from '../../src/modules/bookmarks/bookmarks.module';
import { DecksModule } from '../../src/modules/decks/decks.module';
import { classValidatorContainer } from '../util/classValidatorContainer';
import { createDeck, createDeckMultipleSeeds, createDeckSeed, registerSeed } from '../util/seeds';
import { AllDecksDto } from '../../src/modules/decks/dto/all-decks-dto';

describe('/decks/search (GET)', () => {
  let app: INestApplication;
  let server: any;

  let getDeckEndpoint = (id: string | number) => `/decks/${id}`;

  let token: string = '';


  process.env.JWT_SECRET = 'QEIOGNWEIOHNWEWQTYQ';

  const deckSubmission = createDeck('a');
  let deckSeeds: IDeckSubmissionSuccess[] = [];
  const deckWithDifferentTitle = createDeck('l');

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

    deckSeeds = await createDeckMultipleSeeds(
      app,
      token,
      deckSubmission,
      validationRules.deck.search.limit + 1

    );

    await createDeckSeed(app, token, deckWithDifferentTitle);
  });

  it('Returns the first page of decks that match the input (default page) and sorted by default options', async () => {
    const result = await request(server)
      .get(getDeckEndpoint('search?title=a'))
      .expect(HttpStatus.OK);

    const decks: AllDecksDto[] = result.body;

    expect(decks.length).toBe(validationRules.deck.search.limit);
    const sortedDecks = [...decks].sort((a, b) => a.title.localeCompare(b.title) || a.id - b.id);
    expect(decks).toEqual(sortedDecks);
  });

  it('Returns the first page of decks that match the input (page 1), sorted by title descending', async () => {
    const result = await request(server)
      .get(getDeckEndpoint('search?title=a&order=desc&sortBy=title'))
      .expect(HttpStatus.OK);

    const decks: AllDecksDto[] = result.body;

    expect(decks.length).toBe(validationRules.deck.search.limit);
    const sortedDecks = [...decks].sort((a, b) => b.title.localeCompare(a.title) || a.id - b.id);
    expect(decks).toEqual(sortedDecks);
  });

  it('Returns decks on a page different than one', async () => {
    const result = await request(server)
      .get(getDeckEndpoint('search?page=2&title=a'))
      .expect(HttpStatus.OK);

    const decks: AllDecksDto[] = result.body;
    expect(decks.length).toBe(1);
  });

  afterEach(async () => {
    await app.close();
  });
});