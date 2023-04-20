import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { IDeckSubmission, IDeckSubmissionFailure } from '../util/interfaces';
import { TypeOrmSQLITETestingModule } from '../util/memoryDatabase';
import { validationMessages } from '../../src/constants/validationMessages';
import { invalidActionsMessages } from '../../src/constants/invalidActionsMessages';
import { validationRules } from '../../src/constants/validationRules';
import { AccountsModule } from '../../src/modules/accounts/accounts.module';
import { BookmarksModule } from '../../src/modules/bookmarks/bookmarks.module';
import { DecksModule } from '../../src/modules/decks/decks.module';
import { classValidatorContainer } from '../util/classValidatorContainer';
import { createDeck, createDeckSeed, registerSeed } from '../util/seeds';
import { IUser, IHttpError } from '../../src/interfaces';
import { GetDeckDto } from '../../src/modules/decks/dto/get-deck.dto';

describe('/decks/{id} (PUT)', () => {
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
  let token2: string = '';

  const editDeckSubmission = createDeck('b');

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

  it('Returns 404 if the deck is deleted', async () => {
    await request(server)
      .del(getDeckEndpoint(id))
      .set('Authorization', token);

    const result = await request(server)
      .put(getDeckEndpoint(id))
      .set('Authorization', token)
      .send(editDeckSubmission)
      .expect(HttpStatus.NOT_FOUND);

    const res: IHttpError = result.body;
    expect(res.message.includes(invalidActionsMessages.deckDoesNotExist)).toBe(true);
  });

  afterEach(async () => {
    await app.close();
  });
});