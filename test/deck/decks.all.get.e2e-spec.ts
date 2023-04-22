import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmSQLITETestingModule } from '../util/memoryDatabase';
import { validationRules } from '../../src/constants/validationRules';
import { AccountsModule } from '../../src/modules/accounts/accounts.module';
import { BookmarksModule } from '../../src/modules/bookmarks/bookmarks.module';
import { DecksModule } from '../../src/modules/decks/decks.module';
import { classValidatorContainer } from '../util/classValidatorContainer';
import { createDeck, createDeckMultipleSeeds, createDeckSeed, registerSeed } from '../util/seeds';
import { IUser } from '../../src/interfaces';
import { AllDecksDto } from '../../src/modules/decks/dto/all-decks-dto';
import { DeckListDto } from '../../src/modules/decks/dto/deck-list-dto';

describe('/decks/all (GET)', () => {
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


  it('Returns an empty array if there are no decks', async () => {
    const result = await request(server)
      .get(getDeckEndpoint('all'))
      .expect(HttpStatus.OK);

    const { decks, total } = result.body as DeckListDto;

    expect(decks).toEqual([]);
    expect(total).toBe(0);
  });

  it('Returns an array of decks', async () => {
    const deck = await createDeckSeed(app, token, deckSubmission);
    const result = await request(server)
      .get(getDeckEndpoint('all'))
      .expect(HttpStatus.OK);

    const { decks, total } = result.body as DeckListDto;
    const firstDeck = decks[0];
    expect(firstDeck.id).toBe(deck.id);
    expect(firstDeck.title).toBe(deckSubmission.title);
    expect(firstDeck.description).toBe(deckSubmission.description);
    expect(firstDeck.authorId).toBe(user.id);

    expect(total).toBe(1);
  });

  it('Returns by page successfully', async () => {
    await createDeckMultipleSeeds(app, token, deckSubmission, validationRules.deck.search.limit + 1);
    const result = await request(server)
      .get(getDeckEndpoint('all?page=2'))
      .expect(HttpStatus.OK);

    const { decks, total } = result.body as DeckListDto;
    expect(decks.length).toBe(1);
    expect(total).toBe(validationRules.deck.search.limit + 1);
  });

  it('Returns decks sorted by title ascending', async () => {
    const differentDeck = createDeck('x');
    await createDeckSeed(app, token, differentDeck);

    const result = await request(server)
      .get(getDeckEndpoint('all?sortBy=title&order=asc'))
      .expect(HttpStatus.OK);

    const { decks, total } = result.body as DeckListDto;
    const sortedDecks = [...decks].sort((a, b) => a.title.localeCompare(b.title) || a.id - b.id);
    expect(decks).toEqual(sortedDecks);
  });

  it('Returns decks sorted by title descending', async () => {
    const differentDeck = createDeck('x');
    await createDeckSeed(app, token, differentDeck);

    const result = await request(server)
      .get(getDeckEndpoint('all?sortBy=title&order=desc'))
      .expect(HttpStatus.OK);

    const { decks, total } = result.body as DeckListDto;
    const sortedDecks = [...decks].sort((a, b) => b.title.localeCompare(a.title) || a.id - b.id);
    expect(decks).toEqual(sortedDecks);
  });

  it('Returns paginated and sorted decks successfully', async () => {
    const deck = createDeck('a');
    const deckMultiple = createDeck('x');

    const createdDeck = await createDeckSeed(app, token, deck);
    await createDeckMultipleSeeds(app, token, deckMultiple, validationRules.deck.search.limit);

    const result = await request(server)
      .get(getDeckEndpoint('all?sortBy=title&order=desc&page=2'))
      .expect(HttpStatus.OK);

    const { decks, total } = result.body as DeckListDto;
    const lastDeck = decks[0];
    expect(decks.length).toBe(1);
    expect(lastDeck.id).toBe(createdDeck.id);
    expect(total).toBe(validationRules.deck.search.limit + 1);
  });

  it('Does not retrieve deleted decks', async () => {
    const d1 = await createDeckSeed(app, token, deckSubmission);
    const d2 = await createDeckSeed(app, token, deckSubmission);

    await request(server)
      .del(getDeckEndpoint(d1.id))
      .set('Authorization', token);

    const result = await request(server)
      .get(getDeckEndpoint('all'))
      .expect(HttpStatus.OK);

    const { decks, total } = result.body as DeckListDto;
    expect(decks.length).toBe(1);
    expect(decks[0].id).toBe(d2.id);
    expect(total).toBe(1);
  });

  afterEach(async () => {
    await app.close();
  });
});