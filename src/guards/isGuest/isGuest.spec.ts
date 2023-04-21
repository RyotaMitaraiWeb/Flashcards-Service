import { Controller, Get, HttpStatus, INestApplication, Module, NestModule, UseGuards } from '@nestjs/common';
import { AppModule } from '../../app.module';
import { JwtService } from '@nestjs/jwt';
import { IsGuestGuard } from './isGuest';
import { Test, TestingModule } from '@nestjs/testing';
import { UserDto } from '../../modules/accounts/dto/user-dto';
import * as request from 'supertest';
import { jwtBlacklist } from '../../modules/accounts/jwtBlacklist';

describe('isGuestGuard', () => {
  let app: INestApplication;
  let server: any;

  let jwtService: JwtService;
  let token = '';

  let user: UserDto = {
    id: 1,
    username: 'ryota1',
  };

  process.env.JWT_SECRET = 'oepnweio2313nonjkngwejkgAIOEUGNQE';

  @Controller()
  class TestController {
    @Get('test')
    @UseGuards(IsGuestGuard)
    test() {
      return {};
    }
  }

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [],
      controllers: [TestController],
      providers: [JwtService],
    }).compile();
    
    app = moduleFixture.createNestApplication();
    await app.init();

    jwtService = moduleFixture.get<JwtService>(JwtService);
    server = app.getHttpServer();

    token = await jwtService.signAsync(user, {
      secret: process.env.JWT_SECRET,
      expiresIn: '7d',
    });
  });

  it('Lets in requests from guests', async () => {
    await request(server)
      .get('/test')
      .expect(HttpStatus.OK);
  });

  it('Lets in requests with blacklisted JWTs', async () => {
    jwtBlacklist.add(token);

    await request(server)
      .get('/test')
      .set('Authorization', `Bearer ${token}`)
      .expect(HttpStatus.OK);
  });

  it('Blocks requests from logged in users', async () => {
    await request(server)
      .get('/test')
      .set('Authorization', `Bearer ${token}`)
      .expect(HttpStatus.FORBIDDEN);
  });

  afterEach(async () => {
    if (jwtBlacklist.has(token)) {
      jwtBlacklist.delete(token);
    }

    await app.close();
  });
});