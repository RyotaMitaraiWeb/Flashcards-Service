import { Controller, Get, HttpStatus, INestApplication, UseGuards } from '@nestjs/common';
import { AppModule } from '../../app.module';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { UserDto } from '../../modules/accounts/dto/user-dto';
import * as request from 'supertest';
import { IsCreatorGuard } from './isCreator';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Deck } from '../../modules/decks/entities/deck.entity';
import { Repository } from 'typeorm';
import { TypeOrmSQLITETestingModule } from '../../../test/util/memoryDatabase';

describe('isCreatorGuard', () => {
  let app: INestApplication;
  let server: any;

  let jwtService: JwtService;
  let deckRepository: Repository<Deck>;
  let token = '';

  let user: UserDto = {
    id: 1,
    username: 'ryota1',
  };

  process.env.JWT_SECRET = 'oepnweio2313nonjkngwejkgAIOEUGNQE';

  @Controller()
  class TestController {
    @Get('test/:id')
    @UseGuards(IsCreatorGuard)
    test() {
      return {};
    }
  }

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmSQLITETestingModule()],
      controllers: [TestController],
      providers: [
        JwtService
      ],
    })
      .overrideProvider(getRepositoryToken(Deck))
      .useClass(Repository)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    jwtService = moduleFixture.get<JwtService>(JwtService);
    deckRepository = moduleFixture.get<Repository<Deck>>(getRepositoryToken(Deck));
    server = app.getHttpServer();

    token = await jwtService.signAsync(user, {
      secret: process.env.JWT_SECRET,
      expiresIn: '7d',
    });
  });

  it('Lets in requests from the creator', async () => {
    jest.spyOn(deckRepository, 'findOne').mockImplementation(async () => {
      const deck = new Deck();
      deck.authorId = user.id;
      return deck;
    });

    await request(server)
      .get('/test/1')
      .set('Authorization', `Bearer ${token}`)
      .expect(HttpStatus.OK);
  });

  it('Blocks requests from non-creator', async () => {
    jest.spyOn(deckRepository, 'findOne').mockImplementation(async () => {
      const deck = new Deck();
      deck.authorId = user.id + 1;
      return deck;
    });

    await request(server)
      .get('/test/1')
      .set('Authorization', `Bearer ${token}`)
      .expect(HttpStatus.FORBIDDEN);
  });

  it('Aborts requests if the deck does not exist', async () => {
    jest.spyOn(deckRepository, 'findOne').mockImplementation(async () => null);
    await request(server)
      .get('/test/0')
      .set('Authorization', `Bearer ${token}`)
      .expect(HttpStatus.NOT_FOUND);
  });

  afterEach(async () => {
    await app.close();
  });
});