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
  AccountBuyCourse,
  AccountCheckPayment,
  AccountLogin,
  AccountRegister,
  AccountUserInfo,
  CourseGetInfo,
  PaymentCheck,
  PaymentGenerateLink,
} from '@school/contracts';
import { verify } from 'jsonwebtoken';
import { UserRole } from '@school/interfaces';

const authLogin: AccountLogin.Request = {
  email: 'b@b.ru',
  password: '1',
};

const authRegister: AccountRegister.Request = {
  ...authLogin,
  displayName: 'George',
};

const courseId = 'courseId';

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

  it('BuyCourse', async () => {
    const paymentLink = 'paymentLink';
    rmqService.mockReply<CourseGetInfo.Response>(CourseGetInfo.topic, {
      course: {
        _id: courseId,
        price: 1000,
      },
    });

    rmqService.mockReply<PaymentGenerateLink.Response>(
      PaymentGenerateLink.topic,
      {
        paymentLink,
      }
    );
    const response = await rmqService.triggerRoute<
      AccountBuyCourse.Request,
      AccountBuyCourse.Response
    >(AccountBuyCourse.topic, {
      courseId,
      userId,
    });
    expect(response.paymentLink).toEqual(paymentLink);

    await expect(
      rmqService.triggerRoute<
        AccountBuyCourse.Request,
        AccountBuyCourse.Response
      >(AccountBuyCourse.topic, {
        courseId,
        userId,
      })
    ).rejects.toThrowError();
  });

  it('CheckPayment', async () => {
    rmqService.mockReply<PaymentCheck.Response>(PaymentCheck.topic, {
      status: 'success',
    });

    const response = await rmqService.triggerRoute<
      AccountCheckPayment.Request,
      AccountCheckPayment.Response
    >(AccountCheckPayment.topic, {
      courseId,
      userId,
    });
    expect(response.status).toEqual('success');
  });

  afterAll(async () => {
    await userRepository.deleteUser(authRegister.email);
    app.close();
  });
});
