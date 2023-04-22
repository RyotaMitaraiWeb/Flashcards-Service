import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { IHttpError } from '../src/interfaces';
import { invalidActionsMessages } from '../src/constants/invalidActionsMessages';
import { TypeOrmSQLITETestingModule } from './util/memoryDatabase';
import { AccountsModule } from '../src/modules/accounts/accounts.module';
import { BookmarksModule } from '../src/modules/bookmarks/bookmarks.module';
import { DecksModule } from '../src/modules/decks/decks.module';
import { classValidatorContainer } from './util/classValidatorContainer';
import { AllDecksDto } from '../src/modules/decks/dto/all-decks-dto';
import { createDeck, createDeckMultipleSeeds, createDeckSeed, registerSeed } from './util/seeds';
import { DeckListDto } from '../src/modules/decks/dto/deck-list-dto';
import { validationRules } from '../src/constants/validationRules';

describe('BookmarkController (e2e)', () => {
  let app: INestApplication;

  let bookmarkEndpoint = (endpoint: string | number) => `/bookmarks/${endpoint}`;
  let bookmarkGetEndpoint = '/bookmarks';
  let server: any;

  let token1 = '';
  let token2 = '';

  let deckId1 = 0;
  let deckId2 = 0;

  process.env.JWT_SECRET = 'QEIOGNWEIOHNWEWQTYQ';

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AccountsModule, BookmarksModule, DecksModule, ...TypeOrmSQLITETestingModule()],
    }).compile();

    app = moduleFixture.createNestApplication();
    classValidatorContainer(app);
    await app.init();
    server = app.getHttpServer();

    const registerResult1 = await registerSeed(app, 'a');
    token1 = `Bearer ${registerResult1.token}`;

    const registerResult2 = await registerSeed(app, 'b');
    token2 = `Bearer ${registerResult2.token}`;

    const deckSubmission1 = createDeck('a');
    const deckSubmission2 = createDeck('b');

    const deckResult1 = await createDeckSeed(app, token1, deckSubmission1);
    deckId1 = deckResult1.id;

    const deckResult2 = await createDeckSeed(app, token2, deckSubmission2);
    deckId2 = deckResult2.id;
  });

  describe('/bookmarks/{id} (POST)', () => {
    it('Creates a bookmark successfully', async () => {
      const result = await request(server)
        .post(bookmarkEndpoint(deckId2))
        .set('Authorization', token1)
        .expect(HttpStatus.CREATED);

      expect(result.body).toEqual({});
    });

    it('Returns 401 if the user is not logged in', async () => {
      const result = await request(server)
        .post(bookmarkEndpoint(deckId1))
        .expect(HttpStatus.UNAUTHORIZED);

      const errors: IHttpError = result.body;
      expect(errors.message.includes(invalidActionsMessages.isNotLoggedIn)).toBe(true);
    });

    it('Returns 403 if the user is the creator of the deck', async () => {
      const result = await request(server)
        .post(bookmarkEndpoint(deckId1))
        .set('Authorization', token1)
        .expect(HttpStatus.FORBIDDEN);

      const errors: IHttpError = result.body;
      expect(errors.message.includes(invalidActionsMessages.isCreator)).toBe(true);
    });

    it('Returns 403 if the user has already bookmarked the deck', async () => {
      await request(server)
        .post(bookmarkEndpoint(deckId1))
        .set('Authorization', token2)
        .expect(HttpStatus.CREATED);

      const result = await request(server)
        .post(bookmarkEndpoint(deckId1))
        .set('Authorization', token2)
        .expect(HttpStatus.FORBIDDEN);

      const errors: IHttpError = result.body;
      expect(errors.message.includes(invalidActionsMessages.hasAlreadyBookmarked)).toBe(true);
    });

    it('Returns 404 if the deck does not exist', async () => {
      const result = await request(server)
        .post(bookmarkEndpoint(0))
        .set('Authorization', token2)
        .expect(HttpStatus.NOT_FOUND);

      const errors: IHttpError = result.body;
      expect(errors.message.includes(invalidActionsMessages.deckDoesNotExist)).toBe(true);
    });
  });

  describe('/bookmarks/{id} (DELETE)', () => {
    it('Removes a bookmark successfully', async () => {
      await request(server)
        .post(bookmarkEndpoint(deckId2))
        .set('Authorization', token1);

      await request(server)
        .del(bookmarkEndpoint(deckId2))
        .set('Authorization', token1)
        .expect(HttpStatus.NO_CONTENT);
    });

    it('Returns 401 if the user is not logged in', async () => {
      const result = await request(server)
        .del(bookmarkEndpoint(deckId1))
        .expect(HttpStatus.UNAUTHORIZED);

      const errors: IHttpError = result.body;
      expect(errors.message.includes(invalidActionsMessages.isNotLoggedIn)).toBe(true);
    });

    it('Returns 403 if the user is the creator of the deck', async () => {
      const result = await request(server)
        .del(bookmarkEndpoint(deckId1))
        .set('Authorization', token1)
        .expect(HttpStatus.FORBIDDEN);

      const errors: IHttpError = result.body;
      expect(errors.message.includes(invalidActionsMessages.isCreator)).toBe(true);
    });

    it('Returns 403 if the user has not bookmarked the deck on first place', async () => {
      const result = await request(server)
        .del(bookmarkEndpoint(deckId1))
        .set('Authorization', token2)
        .expect(HttpStatus.FORBIDDEN);

      const errors: IHttpError = result.body;
      expect(errors.message.includes(invalidActionsMessages.hasNotBookmarked)).toBe(true);
    });

    it('Returns 404 if the deck does not exist', async () => {
      const result = await request(server)
        .del(bookmarkEndpoint(0))
        .set('Authorization', token2)
        .expect(HttpStatus.NOT_FOUND);

      const errors: IHttpError = result.body;
      expect(errors.message.includes(invalidActionsMessages.deckDoesNotExist)).toBe(true);
    });
  });

  describe('/bookmarks (GET)', () => {
    it('Returns the user\'s bookmarks', async () => {
      await request(server)
        .post(bookmarkEndpoint(1))
        .set('Authorization', token2);

      const result = await request(server)
        .get(bookmarkGetEndpoint)
        .set('Authorization', token2)
        .expect(HttpStatus.OK);

      const { decks, total } = result.body as DeckListDto;
      expect(decks.length).toBe(1);
      expect(decks[0].id).toBe(deckId1);
      expect(total).toBe(1);
    });

    it('Returns an empty array if the user has not bookmarked any decks', async () => {
      const result = await request(server)
        .get(bookmarkGetEndpoint)
        .set('Authorization', token2)
        .expect(HttpStatus.OK);

      const { decks, total } = result.body as DeckListDto;
      expect(decks).toEqual([]);
      expect(total).toBe(0);
    });

    it('Paginates successfully', async () => {
      const deckSubmission = createDeck('x');
      const deckIds = await createDeckMultipleSeeds(app, token2, deckSubmission, validationRules.deck.search.limit + 1);
      for (const deck of deckIds) {
        await request(server)
          .post(bookmarkEndpoint(deck.id))
          .set('Authorization', token1);
      }

      const result1 = await request(server)
        .get(bookmarkGetEndpoint)
        .set('Authorization', token1);

      const { decks, total } = result1.body as DeckListDto;
      expect(decks.length).toBe(validationRules.deck.search.limit);
      expect(total).toBe(validationRules.deck.search.limit + 1);

      const result2 = await request(server)
        .get(`${bookmarkGetEndpoint}?page=2`)
        .set('Authorization', token1);

      const { decks: decks2, total: total2 } = result2.body as DeckListDto;
      expect(decks2.length).toBe(1);
      expect(total2).toBe(validationRules.deck.search.limit + 1);
    });

    it('Sorts the decks by title successfully', async () => {
      const deckSubmission = createDeck('x');
      const deckIds = await createDeckMultipleSeeds(app, token2, deckSubmission, validationRules.deck.search.limit);
      for (const deck of deckIds) {
        await request(server)
          .post(bookmarkEndpoint(deck.id))
          .set('Authorization', token1);
      }

      const newDeck = createDeck('a');
      const newDeckResult = await createDeckSeed(app, token2, newDeck);
      await request(server)
        .post(bookmarkEndpoint(newDeckResult.id))
        .set('Authorization', token1);

      const result1 = await request(server)
        .get(bookmarkGetEndpoint)
        .set('Authorization', token1);

      const { decks: decks1 } = result1.body as DeckListDto;
      const sortedDecks1 = [...decks1].sort((d1, d2) => d1.title.localeCompare(d2.title) || d1.id - d2.id);
      expect(decks1).toEqual(sortedDecks1);

      const result2 = await request(server)
        .get(`${bookmarkGetEndpoint}?sortBy=title&order=asc`)
        .set('Authorization', token1);

      const { decks: decks2 } = result2.body as DeckListDto;
      expect(decks2).toEqual(sortedDecks1);

      const result3 = await request(server)
        .get(`${bookmarkGetEndpoint}?sortBy=title&order=desc`)
        .set('Authorization', token1);

      const { decks: decks3 } = result3.body as DeckListDto;
      const sortedDecks2 = [...decks3].sort((d1, d2) => d2.title.localeCompare(d1.title) || d1.id - d2.id);
      expect(sortedDecks2).toEqual(decks3);
    });

    it('Sorts and paginates successfully', async () => {
      const deckSubmission = createDeck('x');
      const deckIds = await createDeckMultipleSeeds(app, token2, deckSubmission, validationRules.deck.search.limit);

      for (const deck of deckIds) {
        await request(server)
          .post(bookmarkEndpoint(deck.id))
          .set('Authorization', token1);
      }

      const newDeck = createDeck('a');
      const newDeckResult = await createDeckSeed(app, token2, newDeck);
      await request(server)
        .post(bookmarkEndpoint(newDeckResult.id))
        .set('Authorization', token1);

      const result = await request(server)
        .get(`${bookmarkGetEndpoint}?sortBy=title&order=desc&page=2`)
        .set('Authorization', token1);

      const { decks } = result.body as DeckListDto;
      expect(decks.length).toBe(1);
      expect(decks[0].title).toBe('a'.repeat(validationRules.deck.title.minLength));
    });

    it('Returns 401 if the user is not logged in', async () => {
      const result = await request(server)
        .get(bookmarkGetEndpoint)
        .expect(HttpStatus.UNAUTHORIZED);

      const res: IHttpError = result.body;
      expect(res.message.includes(invalidActionsMessages.isNotLoggedIn)).toBe(true);
    });
  });

  afterEach(async () => {
    await app.close();
  })
});