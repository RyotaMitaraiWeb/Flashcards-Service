import { INestApplication } from '@nestjs/common';
import { validationRules } from '../../src/constants/validationRules';
import { IAuthBody, IDeckSubmission, IDeckSubmissionSuccess } from './interfaces';
import * as request from 'supertest';
import { ICreatedSession } from '../../src/interfaces';

export async function registerSeed(app: INestApplication, letter = 'a') {
  const body: IAuthBody = {
    username: letter.repeat(validationRules.account.username.minLength),
    password: letter.repeat(validationRules.account.password.minLength),
  };

  const result = await request(app.getHttpServer())
    .post('/accounts/register')
    .send(body);
  
  const res: ICreatedSession = result.body;
  return res;
}

export function createDeck(letter = 'a') {
  const submission: IDeckSubmission = {
    title: letter.repeat(validationRules.deck.title.minLength),
    description: '',
    flashcards: [],
  }

  for (let i = 0; i < validationRules.deck.flashcards.minimumFlashcards; i++) {
    submission.flashcards[i] = {
      front: letter.repeat(validationRules.flashcard.sideMinLength),
      back: letter.repeat(validationRules.flashcard.sideMinLength)
    };
  }

  return submission;
}

export async function createDeckSeed(app: INestApplication, token: string, deck: IDeckSubmission) {

  if (!token.startsWith('Bearer ')) {
    token = `Bearer ${token}`;
  }

  const result = await request(app.getHttpServer())
    .post('/decks')
    .set('Authorization', token)
    .send(deck);

  const res: IDeckSubmissionSuccess = result.body;
  return res;
}

export async function createDeckMultipleSeeds(app: INestApplication, token: string, deck: IDeckSubmission, n = 2) {
  const decks: IDeckSubmissionSuccess[] = [];
  for (let i = 0; i < n; i++) {
    const deckRes = await createDeckSeed(app, token, deck);
    decks.push(deckRes);
  }

  return decks;
}