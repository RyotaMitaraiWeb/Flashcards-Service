import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { IAuthBody, IDeckSubmission, IDeckSubmissionFailure, IDeckSubmissionSuccess } from './util/interfaces';
import { ICreatedSession, IUser } from '../src/interfaces';
import { TypeOrmSQLITETestingModule } from './util/memoryDatabase';
import { validationMessages } from '../src/constants/validationMessages';
import { invalidActionsMessages } from '../src/constants/invalidActionsMessages';
import { validationRules } from '../src/constants/validationRules';
import { useContainer } from 'class-validator';
import { GetDeckDto } from '../src/modules/decks/dto/get-deck.dto';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let server: any;

  let deckEndpoint = '/decks';
  let getDeckEndpoint = (id: string | number) => `/decks/${id}`;

  let token: string = '';

  process.env.JWT_SECRET = 'QEIOGNWEIOHNWEWQTYQ';

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmSQLITETestingModule(), AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    useContainer(app.select(AppModule), { fallbackOnErrors: true });
    app.useGlobalPipes(new ValidationPipe());

    await app.init();

    server = app.getHttpServer();
    let register: IAuthBody = {
      username: 'ryota1',
      password: '123456'
    };

    const result = await request(server)
      .post('/accounts/register')
      .send(register);

    const res: ICreatedSession = result.body;
    token = `Bearer ${res.token}`;

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
    const registerBody: IAuthBody = {
      username: 'a'.repeat(validationRules.account.username.minLength),
      password: 'a'.repeat(validationRules.account.password.minLength),
    };

    const deckSubmission: IDeckSubmission = {
      title: 'a'.repeat(validationRules.deck.title.minLength),
      description: '',
      flashcards: [],
    }

    for (let i = 0; i < validationRules.deck.flashcards.minimumFlashcards; i++) {
      deckSubmission.flashcards[i] = {
        front: 'a'.repeat(validationRules.flashcard.sideMinLength),
        back: 'a'.repeat(validationRules.flashcard.sideMinLength)
      };
    }

    let token: string = '';
    let id: number = 0;
    let user: IUser = {
      id: 0,
      username: ''
    }

    beforeEach(async () => {
      const result = await request(server)
        .post('/accounts/register')
        .send(registerBody);

      const res: ICreatedSession = result.body;
      token = res.token;
      user = res.user;

      const deckResult = await request(server)
        .post(deckEndpoint)
        .set('Authorization', `Bearer ${token}`)
        .send(deckSubmission);

      const deckRes: IDeckSubmissionSuccess = deckResult.body;
      id = deckRes.id;
    });

    it('Retrieves a deck successfully', async () => {
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

  afterEach(async () => {
    await app.close();
  });
});