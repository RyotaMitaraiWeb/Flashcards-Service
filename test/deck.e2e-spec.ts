import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { IAuthBody, IDeckSubmission, IDeckSubmissionFailure, IDeckSubmissionSuccess } from './util/interfaces';
import { IHttpError, IUser } from '../src/interfaces';
import { TypeOrmSQLITETestingModule } from './util/memoryDatabase';
import { validationMessages } from '../src/constants/validationMessages';
import { invalidActionsMessages } from '../src/constants/invalidActionsMessages';
import { validationRules } from '../src/constants/validationRules';
import { GetDeckDto } from '../src/modules/decks/dto/get-deck.dto';
import { AllDecksDto } from '../src/modules/decks/dto/all-decks-dto';
import { AccountsModule } from '../src/modules/accounts/accounts.module';
import { BookmarksModule } from '../src/modules/bookmarks/bookmarks.module';
import { DecksModule } from '../src/modules/decks/decks.module';
import { classValidatorContainer } from './util/classValidatorContainer';
import { registerSeed, createDeckSeed, createDeck, createDeckMultipleSeeds } from './util/seeds';

describe('DecksController (e2e)', () => {
  let app: INestApplication;
  let server: any;

  let deckEndpoint = '/decks';
  let getDeckEndpoint = (id: string | number) => `/decks/${id}`;

  let token: string = '';
  let user: IUser = {
    id: 0,
    username: '',
  };

  // const urlBuilder = ()

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

  describe('/decks (POST)', () => {
    it('Successfully creates a deck', async () => {
      const deck: IDeckSubmission = {
        title: 'a'.repeat(validationRules.deck.title.minLength),
        description: 'a',
        flashcards: [{
          front: 'a'.repeat(validationRules.flashcard.sideMinLength),
          back: 'a'.repeat(validationRules.flashcard.sideMinLength),
        }],
      };

      const result = await request(server)
        .post(deckEndpoint)
        .set('Authorization', token)
        .send(deck)
        .expect(HttpStatus.CREATED);

      const res: IDeckSubmissionSuccess = result.body;
      expect(res.id).toBe(1);
    });

    it('Successfully creates a deck (with no description)', async () => {
      const deck: IDeckSubmission = {
        title: 'a'.repeat(validationRules.deck.title.minLength),
        description: '',
        flashcards: [{
          front: 'a'.repeat(validationRules.flashcard.sideMinLength),
          back: 'a'.repeat(validationRules.flashcard.sideMinLength),
        }],
      };

      const result = await request(server)
        .post(deckEndpoint)
        .set('Authorization', token)
        .send(deck)
        .expect(HttpStatus.CREATED);

      const res: IDeckSubmissionSuccess = result.body;
      expect(res.id).toBe(1);
    });

    it('Returns 401 if the user is not logged in', async () => {
      const deck: IDeckSubmission = {
        title: 'a'.repeat(validationRules.deck.title.minLength),
        description: '',
        flashcards: [{
          front: 'a'.repeat(validationRules.flashcard.sideMinLength),
          back: 'a'.repeat(validationRules.flashcard.sideMinLength),
        }],
      };

      const result = await request(server)
        .post(deckEndpoint)
        .send(deck)
        .expect(HttpStatus.UNAUTHORIZED);

      const res: IDeckSubmissionFailure = result.body;
      expect(res.message.includes(invalidActionsMessages.isNotLoggedIn)).toBe(true);
    });

    it('Returns 400 if the title is too short', async () => {
      const deck: IDeckSubmission = {
        title: 'a'.repeat(validationRules.deck.title.minLength - 1),
        description: '',
        flashcards: [{
          front: 'a'.repeat(validationRules.flashcard.sideMinLength),
          back: 'a'.repeat(validationRules.flashcard.sideMinLength),
        }],
      };

      const result = await request(server)
        .post(deckEndpoint)
        .set('Authorization', token)
        .send(deck)
        .expect(HttpStatus.BAD_REQUEST);

      const res: IDeckSubmissionFailure = result.body;
      expect(res.message.includes(validationMessages.deck.title.isTooShort)).toBe(true);
    });

    it('Returns 400 if the title is too long', async () => {
      const deck: IDeckSubmission = {
        title: 'a'.repeat(validationRules.deck.title.maxLength + 1),
        description: '',
        flashcards: [{
          front: 'a'.repeat(validationRules.flashcard.sideMinLength),
          back: 'a'.repeat(validationRules.flashcard.sideMinLength),
        }],
      };

      const result = await request(server)
        .post(deckEndpoint)
        .set('Authorization', token)
        .send(deck)
        .expect(HttpStatus.BAD_REQUEST);

      const res: IDeckSubmissionFailure = result.body;
      expect(res.message.includes(validationMessages.deck.title.isTooLong)).toBe(true);
    });

    it('Returns 400 if the title is not a string', async () => {
      const deck: IDeckSubmission = {
        title: 1 as any,
        description: '',
        flashcards: [{
          front: 'a'.repeat(validationRules.flashcard.sideMinLength),
          back: 'a'.repeat(validationRules.flashcard.sideMinLength),
        }],
      };

      const result = await request(server)
        .post(deckEndpoint)
        .set('Authorization', token)
        .send(deck)
        .expect(HttpStatus.BAD_REQUEST);

      const res: IDeckSubmissionFailure = result.body;
      expect(res.message.includes(validationMessages.deck.title.isNotString)).toBe(true);
    });

    it('Returns 400 if the description is too long', async () => {
      const deck: IDeckSubmission = {
        title: 'a'.repeat(validationRules.deck.title.minLength),
        description: 1 as any,
        flashcards: [{
          front: 'a'.repeat(validationRules.flashcard.sideMinLength),
          back: 'a'.repeat(validationRules.flashcard.sideMinLength),
        }],
      };

      const result = await request(server)
        .post(deckEndpoint)
        .set('Authorization', token)
        .send(deck)
        .expect(HttpStatus.BAD_REQUEST);

      const res: IDeckSubmissionFailure = result.body;
      expect(res.message.includes(validationMessages.deck.description.isNotString)).toBe(true);
    });

    it('Returns 400 if the description is too long', async () => {
      const deck: IDeckSubmission = {
        title: 'a'.repeat(validationRules.deck.title.minLength),
        description: 'a'.repeat(validationRules.deck.description.maxLength + 1),
        flashcards: [{
          front: 'a'.repeat(validationRules.flashcard.sideMinLength),
          back: 'a'.repeat(validationRules.flashcard.sideMinLength),
        }],
      };

      const result = await request(server)
        .post(deckEndpoint)
        .set('Authorization', token)
        .send(deck)
        .expect(HttpStatus.BAD_REQUEST);

      const res: IDeckSubmissionFailure = result.body;
      expect(res.message.includes(validationMessages.deck.description.isTooLong)).toBe(true);
    });

    it('Returns 400 if there are not enough flashcards', async () => {
      const deck: IDeckSubmission = {
        title: 'a'.repeat(validationRules.deck.title.minLength),
        description: '',
        flashcards: [],
      };

      for (let i = 0; i < validationRules.deck.flashcards.minimumFlashcards - 1; i++) {
        deck.flashcards[i] = {
          front: 'a'.repeat(validationRules.flashcard.sideMinLength),
          back: 'a'.repeat(validationRules.flashcard.sideMinLength),
        };
      }

      const result = await request(server)
        .post(deckEndpoint)
        .set('Authorization', token)
        .send(deck)
        .expect(HttpStatus.BAD_REQUEST);

      const res: IDeckSubmissionFailure = result.body;
      expect(res.message.includes(validationMessages.deck.flashcards.notEnoughFlashcards)).toBe(true);
    });

    it('Returns 400 if the flashcards are not an array', async () => {
      const deck: IDeckSubmission = {
        title: 'a'.repeat(validationRules.deck.title.minLength),
        description: '',
        flashcards: 1 as any,
      };

      const result = await request(server)
        .post(deckEndpoint)
        .set('Authorization', token)
        .send(deck)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('Returns 400 if at least one front side is too short', async () => {
      const deck: IDeckSubmission = {
        title: 'a'.repeat(validationRules.deck.title.minLength),
        description: '',
        flashcards: [{
          front: 'a'.repeat(validationRules.flashcard.sideMinLength - 1),
          back: 'a'.repeat(validationRules.flashcard.sideMinLength),
        }],
      };

      for (let i = 1; i < validationRules.deck.flashcards.minimumFlashcards + 1; i++) {
        deck.flashcards[i] = {
          front: 'a'.repeat(validationRules.flashcard.sideMinLength),
          back: 'a'.repeat(validationRules.flashcard.sideMinLength),
        };
      }

      const result = await request(server)
        .post(deckEndpoint)
        .set('Authorization', token)
        .send(deck)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('Returns 400 if at least one back side is too short', async () => {
      const deck: IDeckSubmission = {
        title: 'a'.repeat(validationRules.deck.title.minLength),
        description: '',
        flashcards: [{
          front: 'a'.repeat(validationRules.flashcard.sideMinLength),
          back: 'a'.repeat(validationRules.flashcard.sideMinLength - 1),
        }],
      };

      for (let i = 1; i < validationRules.deck.flashcards.minimumFlashcards + 1; i++) {
        deck.flashcards[i] = {
          front: 'a'.repeat(validationRules.flashcard.sideMinLength),
          back: 'a'.repeat(validationRules.flashcard.sideMinLength),
        };
      }

      const result = await request(server)
        .post(deckEndpoint)
        .set('Authorization', token)
        .send(deck)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('Returns 400 if at least one front side is too short', async () => {
      const deck: IDeckSubmission = {
        title: 'a'.repeat(validationRules.deck.title.minLength),
        description: '',
        flashcards: [{
          front: 'a'.repeat(validationRules.flashcard.sideMaxLength + 1),
          back: 'a'.repeat(validationRules.flashcard.sideMinLength),
        }],
      };

      for (let i = 1; i < validationRules.deck.flashcards.minimumFlashcards + 1; i++) {
        deck.flashcards[i] = {
          front: 'a'.repeat(validationRules.flashcard.sideMinLength),
          back: 'a'.repeat(validationRules.flashcard.sideMinLength),
        };
      }

      const result = await request(server)
        .post(deckEndpoint)
        .set('Authorization', token)
        .send(deck)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('Returns 400 if at least one back side is too long', async () => {
      const deck: IDeckSubmission = {
        title: 'a'.repeat(validationRules.deck.title.minLength),
        description: '',
        flashcards: [{
          front: 'a'.repeat(validationRules.flashcard.sideMinLength),
          back: 'a'.repeat(validationRules.flashcard.sideMaxLength + 1),
        }],
      };

      for (let i = 1; i < validationRules.deck.flashcards.minimumFlashcards + 1; i++) {
        deck.flashcards[i] = {
          front: 'a'.repeat(validationRules.flashcard.sideMinLength),
          back: 'a'.repeat(validationRules.flashcard.sideMinLength),
        };
      }

      const result = await request(server)
        .post(deckEndpoint)
        .set('Authorization', token)
        .send(deck)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('Returns 400 if the front property is missing on at least one flashcard', async () => {
      const deck: IDeckSubmission = {
        title: 'a'.repeat(validationRules.deck.title.minLength),
        description: '',
        flashcards: [
          {
            back: 'a'.repeat(validationRules.flashcard.sideMinLength)
          } as any],
      };

      for (let i = 1; i < validationRules.deck.flashcards.minimumFlashcards + 1; i++) {
        deck.flashcards[i] = {
          front: 'a'.repeat(validationRules.flashcard.sideMinLength),
          back: 'a'.repeat(validationRules.flashcard.sideMinLength),
        };
      }

      const result = await request(server)
        .post(deckEndpoint)
        .set('Authorization', token)
        .send(deck)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('Returns 400 if the back property is missing on at least one flashcard', async () => {
      const deck: IDeckSubmission = {
        title: 'a'.repeat(validationRules.deck.title.minLength),
        description: '',
        flashcards: [
          {
            front: 'a'.repeat(validationRules.flashcard.sideMinLength)
          } as any],
      };

      for (let i = 1; i < validationRules.deck.flashcards.minimumFlashcards + 1; i++) {
        deck.flashcards[i] = {
          front: 'a'.repeat(validationRules.flashcard.sideMinLength),
          back: 'a'.repeat(validationRules.flashcard.sideMinLength),
        };
      }

      const result = await request(server)
        .post(deckEndpoint)
        .set('Authorization', token)
        .send(deck)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('Returns 400 if the front side of a flashcard is not a string', async () => {
      const deck: IDeckSubmission = {
        title: 'a'.repeat(validationRules.deck.title.minLength),
        description: '',
        flashcards: [
          {
            front: 1 as any,
            back: 'a'.repeat(validationRules.flashcard.sideMinLength)
          }
        ],
      };

      for (let i = 1; i < validationRules.deck.flashcards.minimumFlashcards + 1; i++) {
        deck.flashcards[i] = {
          front: 'a'.repeat(validationRules.flashcard.sideMinLength),
          back: 'a'.repeat(validationRules.flashcard.sideMinLength),
        };
      }

      const result = await request(server)
        .post(deckEndpoint)
        .set('Authorization', token)
        .send(deck)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('Returns 400 if the front side of a flashcard is not a string', async () => {
      const deck: IDeckSubmission = {
        title: 'a'.repeat(validationRules.deck.title.minLength),
        description: '',
        flashcards: [
          {
            front: 'a'.repeat(validationRules.flashcard.sideMinLength),
            back: 1 as any
          }
        ],
      };

      for (let i = 1; i < validationRules.deck.flashcards.minimumFlashcards + 1; i++) {
        deck.flashcards[i] = {
          front: 'a'.repeat(validationRules.flashcard.sideMinLength),
          back: 'a'.repeat(validationRules.flashcard.sideMinLength),
        };
      }

      const result = await request(server)
        .post(deckEndpoint)
        .set('Authorization', token)
        .send(deck)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('Returns 401 if the user is not logged in', async () => {
      const deck: IDeckSubmission = {
        title: 'a'.repeat(validationRules.deck.title.minLength),
        description: 'a',
        flashcards: [{
          front: 'a'.repeat(validationRules.flashcard.sideMinLength),
          back: 'a'.repeat(validationRules.flashcard.sideMinLength),
        }],
      };

      const result = await request(server)
        .post(deckEndpoint)
        .send(deck)
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('/decks/{id} (GET)', () => {
    let token: string = '';
    let id: number = 0;
    let user: IUser = {
      id: 0,
      username: ''
    }

    beforeEach(async () => {
      const registerResult = await registerSeed(app, 'a');

      token = registerResult.token;
      user = registerResult.user;

      const deckResult = await createDeckSeed(app, token, deckSubmission);
      id = deckResult.id;
    });

    it('Retrieves a deck successfully (logged out => no bookmark)', async () => {
      const result = await request(server)
        .get(getDeckEndpoint(id))
        .expect(HttpStatus.OK);

      const res: GetDeckDto = result.body;
      expect(res).toEqual<GetDeckDto>({
        id,
        title: deckSubmission.title,
        description: deckSubmission.description,
        authorId: user.id,
        flashcards: deckSubmission.flashcards,
        bookmarked: false,
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
      expect(deck).toEqual<GetDeckDto>({
        id,
        title: deckSubmission.title,
        description: deckSubmission.description,
        authorId: user.id,
        flashcards: deckSubmission.flashcards,
        bookmarked: true,
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
      expect(deck).toEqual<GetDeckDto>({
        id,
        title: deckSubmission.title,
        description: deckSubmission.description,
        authorId: user.id,
        flashcards: deckSubmission.flashcards,
        bookmarked: false,
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
  });

  describe('/decks/{id} (DELETE)', () => {
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
  });

  describe('/decks/{id} (PUT)', () => {
    let token2: string = '';

    const editDeckSubmission = createDeck('b');

    let id: number = 0;

    beforeEach(async () => {
      const registerResult = await registerSeed(app, 't');
      token2 = `Bearer ${registerResult.token}`;

      const deckResult = await createDeckSeed(app, token, deckSubmission);
      id = deckResult.id;
    });

    it('Updates the deck successfully', async () => {
      await request(server)
        .put(getDeckEndpoint(id))
        .set('Authorization', token)
        .send(editDeckSubmission)
        .expect(HttpStatus.NO_CONTENT);

      const result = await request(server)
        .get(getDeckEndpoint(id))

      const res: GetDeckDto = result.body;
      expect(res.id).toBe<number>(id);
      expect(res.title).toBe<string>(editDeckSubmission.title);
      expect(res.description).toBe<string>(editDeckSubmission.description);
      expect(res.flashcards.length).toBe<number>(editDeckSubmission.flashcards.length);
    });

    it('Returns 400 if the title is too short', async () => {
      const submission: IDeckSubmission = {
        title: 'a'.repeat(validationRules.deck.title.minLength - 1),
        description: '',
        flashcards: []
      }

      for (let i = 0; i < validationRules.deck.flashcards.minimumFlashcards; i++) {
        submission.flashcards[i] = {
          front: 'a'.repeat(validationRules.flashcard.sideMinLength),
          back: 'a'.repeat(validationRules.flashcard.sideMinLength)
        };
      }

      const result = await request(server)
        .put(getDeckEndpoint(id))
        .set('Authorization', token)
        .send(submission)
        .expect(HttpStatus.BAD_REQUEST);

      const res: IDeckSubmissionFailure = result.body;
      expect(res.message.includes(validationMessages.deck.title.isTooShort)).toBe(true);
    });

    it('Returns 400 if the title is too long', async () => {
      const submission: IDeckSubmission = {
        title: 'a'.repeat(validationRules.deck.title.maxLength + 1),
        description: '',
        flashcards: []
      }

      for (let i = 0; i < validationRules.deck.flashcards.minimumFlashcards; i++) {
        submission.flashcards[i] = {
          front: 'a'.repeat(validationRules.flashcard.sideMinLength),
          back: 'a'.repeat(validationRules.flashcard.sideMinLength)
        };
      }

      const result = await request(server)
        .put(getDeckEndpoint(id))
        .set('Authorization', token)
        .send(submission)
        .expect(HttpStatus.BAD_REQUEST);

      const res: IDeckSubmissionFailure = result.body;
      expect(res.message.includes(validationMessages.deck.title.isTooLong)).toBe(true);
    });

    it('Returns 400 if the title is not a string', async () => {
      const submission: IDeckSubmission = {
        title: 1 as any,
        description: '',
        flashcards: []
      }

      for (let i = 0; i < validationRules.deck.flashcards.minimumFlashcards; i++) {
        submission.flashcards[i] = {
          front: 'a'.repeat(validationRules.flashcard.sideMinLength),
          back: 'a'.repeat(validationRules.flashcard.sideMinLength)
        };
      }

      const result = await request(server)
        .put(getDeckEndpoint(id))
        .set('Authorization', token)
        .send(submission)
        .expect(HttpStatus.BAD_REQUEST);

      const res: IDeckSubmissionFailure = result.body;
      expect(res.message.includes(validationMessages.deck.title.isNotString)).toBe(true);
    });

    it('Returns 400 if the description is too long', async () => {
      const submission: IDeckSubmission = {
        title: 'a'.repeat(validationRules.deck.title.minLength),
        description: 'a'.repeat(validationRules.deck.description.maxLength + 1),
        flashcards: []
      }

      for (let i = 0; i < validationRules.deck.flashcards.minimumFlashcards; i++) {
        submission.flashcards[i] = {
          front: 'a'.repeat(validationRules.flashcard.sideMinLength),
          back: 'a'.repeat(validationRules.flashcard.sideMinLength)
        };
      }

      const result = await request(server)
        .put(getDeckEndpoint(id))
        .set('Authorization', token)
        .send(submission)
        .expect(HttpStatus.BAD_REQUEST);

      const res: IDeckSubmissionFailure = result.body;
      expect(res.message.includes(validationMessages.deck.description.isTooLong)).toBe(true);
    });

    it('Returns 400 if the description is not a string', async () => {
      const submission: IDeckSubmission = {
        title: 'a'.repeat(validationRules.deck.title.minLength),
        description: 1 as any,
        flashcards: []
      }

      for (let i = 0; i < validationRules.deck.flashcards.minimumFlashcards; i++) {
        submission.flashcards[i] = {
          front: 'a'.repeat(validationRules.flashcard.sideMinLength),
          back: 'a'.repeat(validationRules.flashcard.sideMinLength)
        };
      }

      const result = await request(server)
        .put(getDeckEndpoint(id))
        .set('Authorization', token)
        .send(submission)
        .expect(HttpStatus.BAD_REQUEST);

      const res: IDeckSubmissionFailure = result.body;
      expect(res.message.includes(validationMessages.deck.description.isNotString)).toBe(true);
    });

    it('Returns 400 if the flashcards are not an array', async () => {
      const submission: IDeckSubmission = {
        title: 'a'.repeat(validationRules.deck.title.minLength),
        description: '',
        flashcards: 1 as any,
      }

      const result = await request(server)
        .put(getDeckEndpoint(id))
        .set('Authorization', token)
        .send(submission)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('Returns 400 if there are not enough flashcards', async () => {
      const submission: IDeckSubmission = {
        title: 'a'.repeat(validationRules.deck.title.minLength),
        description: '',
        flashcards: [],
      }

      for (let i = 0; i < validationRules.deck.flashcards.minimumFlashcards - 1; i++) {
        submission.flashcards[i] = {
          front: 'a'.repeat(validationRules.flashcard.sideMinLength),
          back: 'a'.repeat(validationRules.flashcard.sideMinLength)
        };
      }

      const result = await request(server)
        .put(getDeckEndpoint(id))
        .set('Authorization', token)
        .send(submission)
        .expect(HttpStatus.BAD_REQUEST);

      const res: IDeckSubmissionFailure = result.body;
      expect(res.message.includes(validationMessages.deck.flashcards.notEnoughFlashcards)).toBe(true);
    });

    it('Returns 400 if at least one front side is too short', async () => {
      const submission: IDeckSubmission = {
        title: 'a'.repeat(validationRules.deck.title.minLength),
        description: '',
        flashcards: [
          {
            front: 'a'.repeat(validationRules.flashcard.sideMinLength - 1),
            back: 'a'.repeat(validationRules.flashcard.sideMinLength),
          }
        ],
      }

      for (let i = 0; i < validationRules.deck.flashcards.minimumFlashcards; i++) {
        submission.flashcards[i + 1] = {
          front: 'a'.repeat(validationRules.flashcard.sideMinLength),
          back: 'a'.repeat(validationRules.flashcard.sideMinLength)
        };
      }

      const result = await request(server)
        .put(getDeckEndpoint(id))
        .set('Authorization', token)
        .send(submission)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('Returns 400 if at least one front side is too long', async () => {
      const submission: IDeckSubmission = {
        title: 'a'.repeat(validationRules.deck.title.minLength),
        description: '',
        flashcards: [
          {
            front: 'a'.repeat(validationRules.flashcard.sideMaxLength + 1),
            back: 'a'.repeat(validationRules.flashcard.sideMinLength),
          }
        ],
      }

      for (let i = 0; i < validationRules.deck.flashcards.minimumFlashcards; i++) {
        submission.flashcards[i + 1] = {
          front: 'a'.repeat(validationRules.flashcard.sideMinLength),
          back: 'a'.repeat(validationRules.flashcard.sideMinLength)
        };
      }

      const result = await request(server)
        .put(getDeckEndpoint(id))
        .set('Authorization', token)
        .send(submission)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('Returns 400 if at least one back side is too short', async () => {
      const submission: IDeckSubmission = {
        title: 'a'.repeat(validationRules.deck.title.minLength),
        description: '',
        flashcards: [
          {
            front: 'a'.repeat(validationRules.flashcard.sideMinLength),
            back: 'a'.repeat(validationRules.flashcard.sideMinLength - 1),
          }
        ],
      }

      for (let i = 0; i < validationRules.deck.flashcards.minimumFlashcards; i++) {
        submission.flashcards[i + 1] = {
          front: 'a'.repeat(validationRules.flashcard.sideMinLength),
          back: 'a'.repeat(validationRules.flashcard.sideMinLength)
        };
      }

      const result = await request(server)
        .put(getDeckEndpoint(id))
        .set('Authorization', token)
        .send(submission)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('Returns 400 if at least one back side is too long', async () => {
      const submission: IDeckSubmission = {
        title: 'a'.repeat(validationRules.deck.title.minLength),
        description: '',
        flashcards: [
          {
            front: 'a'.repeat(validationRules.flashcard.sideMinLength),
            back: 'a'.repeat(validationRules.flashcard.sideMaxLength + 1),
          }
        ],
      }

      for (let i = 0; i < validationRules.deck.flashcards.minimumFlashcards; i++) {
        submission.flashcards[i + 1] = {
          front: 'a'.repeat(validationRules.flashcard.sideMinLength),
          back: 'a'.repeat(validationRules.flashcard.sideMinLength)
        };
      }

      const result = await request(server)
        .put(getDeckEndpoint(id))
        .set('Authorization', token)
        .send(submission)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('Returns 400 if at least one front side is not a string', async () => {
      const submission: IDeckSubmission = {
        title: 'a'.repeat(validationRules.deck.title.minLength),
        description: '',
        flashcards: [
          {
            front: 1 as any,
            back: 'a'.repeat(validationRules.flashcard.sideMaxLength + 1),
          }
        ],
      }

      for (let i = 0; i < validationRules.deck.flashcards.minimumFlashcards; i++) {
        submission.flashcards[i + 1] = {
          front: 'a'.repeat(validationRules.flashcard.sideMinLength),
          back: 'a'.repeat(validationRules.flashcard.sideMinLength)
        };
      }

      const result = await request(server)
        .put(getDeckEndpoint(id))
        .set('Authorization', token)
        .send(submission)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('Returns 400 if at least one back side is not a string', async () => {
      const submission: IDeckSubmission = {
        title: 'a'.repeat(validationRules.deck.title.minLength),
        description: '',
        flashcards: [
          {
            front: 'a'.repeat(validationRules.flashcard.sideMinLength),
            back: 1 as any,
          }
        ],
      }

      for (let i = 0; i < validationRules.deck.flashcards.minimumFlashcards; i++) {
        submission.flashcards[i + 1] = {
          front: 'a'.repeat(validationRules.flashcard.sideMinLength),
          back: 'a'.repeat(validationRules.flashcard.sideMinLength)
        };
      }

      const result = await request(server)
        .put(getDeckEndpoint(id))
        .set('Authorization', token)
        .send(submission)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('Returns 401 if the user is not logged in', async () => {
      const result = await request(server)
        .put(getDeckEndpoint(id))
        .send(editDeckSubmission)
        .expect(HttpStatus.UNAUTHORIZED);

      const res: IHttpError = result.body;
      expect(res.message.includes(invalidActionsMessages.isNotLoggedIn)).toBe(true);
    });

    it('Returns 403 if the user is not the creator', async () => {
      const result = await request(server)
        .put(getDeckEndpoint(id))
        .set('Authorization', token2)
        .send(editDeckSubmission)
        .expect(HttpStatus.FORBIDDEN);

      const res: IHttpError = result.body;
      expect(res.message.includes(invalidActionsMessages.isNotCreator)).toBe(true);
    });

    it('Returns 404 if the deck does not exist', async () => {
      const result = await request(server)
        .put(getDeckEndpoint(0))
        .set('Authorization', token2)
        .send(editDeckSubmission)
        .expect(HttpStatus.NOT_FOUND);

      const res: IHttpError = result.body;
      expect(res.message.includes(invalidActionsMessages.deckDoesNotExist)).toBe(true);
    });
  });

  describe('/decks/all (GET)', () => {
    it('Returns an empty array if there are no decks', async () => {
      const result = await request(server)
        .get(getDeckEndpoint('all'))
        .expect(HttpStatus.OK);

      const res: AllDecksDto[] = result.body;
      expect(res).toEqual([]);
    });

    it('Returns an array of decks', async () => {
      const deck = await createDeckSeed(app, token, deckSubmission);
      const result = await request(server)
        .get(getDeckEndpoint('all'))
        .expect(HttpStatus.OK);

      const res: AllDecksDto[] = result.body;
      expect(res).toEqual<AllDecksDto[]>([
        {
          id: deck.id,
          title: deckSubmission.title,
          description: deckSubmission.description,
          authorId: user.id,
        }
      ]);
    });

    it('Returns by page successfully', async () => {
      await createDeckMultipleSeeds(app, token, deckSubmission, validationRules.deck.search.limit + 1);
      const result = await request(server)
        .get(getDeckEndpoint('all?page=2'))
        .expect(HttpStatus.OK);

      const res: AllDecksDto[] = result.body;
      expect(res.length).toBe(1);
    });

    it('Returns decks sorted by title ascending', async () => {
      const differentDeck = createDeck('x');
      await createDeckSeed(app, token, differentDeck);

      const result = await request(server)
        .get(getDeckEndpoint('all?sortBy=title&order=asc'))
        .expect(HttpStatus.OK);

      const decks: AllDecksDto[] = result.body;
      const sortedDecks = [...decks].sort((a, b) => a.title.localeCompare(b.title) || a.id - b.id);
      expect(decks).toEqual(sortedDecks);
    });

    it('Returns decks sorted by title descending', async () => {
      const differentDeck = createDeck('x');
      await createDeckSeed(app, token, differentDeck);

      const result = await request(server)
        .get(getDeckEndpoint('all?sortBy=title&order=desc'))
        .expect(HttpStatus.OK);

      const decks: AllDecksDto[] = result.body;
      const sortedDecks = [...decks].sort((a, b) => b.title.localeCompare(a.title) || a.id - b.id);
      expect(decks).toEqual(sortedDecks);
    });
  });

  describe('/decks/own (GET)', () => {
    let id1 = 0;

    beforeEach(async () => {
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

    it('Returns only the decks that the user has created', async () => {
      const result = await request(server)
        .get(getDeckEndpoint('own'))
        .set('Authorization', token)
        .expect(HttpStatus.OK);

      const res: AllDecksDto[] = result.body;
      expect(res.length).toBe(1);
      expect(res[0].id).toBe(id1);
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
  });

  describe('/decks/search (GET)', () => {
    let deckSeeds: IDeckSubmissionSuccess[] = [];
    const deckWithDifferentTitle = createDeck('l');

    beforeEach(async () => {
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
  });

  afterEach(async () => {
    await app.close();
  });
});