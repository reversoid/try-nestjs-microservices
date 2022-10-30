import { Test, TestingModule } from '@nestjs/testing';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from './user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { getMongoConfig } from '../configs/mongo.config';
import { RMQModule, RMQService, RMQTestService } from 'nestjs-rmq';
import { INestApplication } from '@nestjs/common';
import { UserRepository } from './repositories/user.repository';
import {
  AccountLogin,
  AccountRegister,
  AccountUserInfo,
} from '@school/contracts';
import { verify } from 'jsonwebtoken';
import { UserRole } from '@school/interfaces';

const authLogin: AccountLogin.Request = {
  email: 'a@a.ru',
  password: '1',
};

const authRegister: AccountRegister.Request = {
  ...authLogin,
  displayName: 'George',
};

describe('UserController', () => {
  let app: INestApplication;
  let userRepository: UserRepository;
  let rmqService: RMQTestService;
  let token: string;
  let configServce: ConfigService;
  let userId: string;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRootAsync(getMongoConfig()),
        RMQModule.forTest({}),
        UserModule,
        AuthModule,
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: 'envs/.account.dev.env',
        }),
      ],
    }).compile();

    app = module.createNestApplication();
    userRepository = app.get<UserRepository>(UserRepository);
    rmqService = app.get(RMQService);
    configServce = app.get<ConfigService>(ConfigService);
    await app.init();

    await rmqService.triggerRoute<
      AccountRegister.Request,
      AccountRegister.Response
    >(AccountRegister.topic, authRegister);

    const { access_token } = await rmqService.triggerRoute<
      AccountLogin.Request,
      AccountLogin.Response
    >(AccountLogin.topic, authLogin);
    token = access_token;
    const data = verify(token, configServce.get('JWT_SECRET'));
    userId = data['id'];
  });

  it('AccountUserInfo', async () => {
    const response = await rmqService.triggerRoute<
      AccountUserInfo.Request,
      AccountUserInfo.Response
    >(AccountUserInfo.topic, {
      id: userId,
    });
    expect(response.profile).toMatchObject({
      displayName: authRegister.displayName,
      email: authRegister.email,
      role: UserRole.Student,
    });
  });

  afterAll(async () => {
    await userRepository.deleteUser(authRegister.email);
    app.close();
  });
});
