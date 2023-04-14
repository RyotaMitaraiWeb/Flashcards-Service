import { Controller, Get, HttpStatus, INestApplication, MiddlewareConsumer, Module, NestModule, Req, UseGuards } from '@nestjs/common';
import { AppModule } from '../../app.module';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { UserDto } from '../../modules/accounts/dto/user-dto';
import * as request from 'supertest';
import { jwtBlacklist } from '../../modules/accounts/jwtBlacklist';
import { IRequest, IUser } from '../../interfaces';
import { AttachUserFromTokenToRequestMiddleware } from './attachUserFromTokenToRequest';

describe('AttachUserFromTokenToRequest', () => {
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
    test(@Req() req: IRequest) {
      return {
        result: req.user,
      };
    }
  }

  @Module({
    controllers: [TestController],
    providers: [JwtService],
  })
  class MiddlewareTestModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
      consumer
        .apply(AttachUserFromTokenToRequestMiddleware)
        .forRoutes(TestController);
    }
  }

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [MiddlewareTestModule],
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

  it('Attaches the user to the request if the token is valid', async () => {
    const result = await request(server)
      .get('/test')
      .set('Authorization', `Bearer ${token}`);

    const res: IUser = result.body.result;
    expect(res.id).toBe(user.id);
    expect(res.username).toBe(res.username);
  });

  it('Attaches null to the request if the token cannot be verified', async () => {
    const result = await request(server)
      .get('/test')

    const res: IUser = result.body.result;
    expect(res).toBe(null);
  });

  it('Attaches null to the request if the token is blacklisted', async () => {
    jwtBlacklist.add(token);

    const result = await request(server)
      .get('/test')
      .set('Authorization', `Bearer ${token}`);

    const res: IUser = result.body.result;
    expect(res).toBe(null);
  });

  afterEach(async () => {
    if (jwtBlacklist.has(token)) {
      jwtBlacklist.delete(token);
    }

    await app.close();
  });
});