import { Injectable } from '@nestjs/common';
import { User } from '@school/interfaces';
import { RMQService } from 'nestjs-rmq';
import { UserEntity } from './entities/user.entity';
import { UserRepository } from './repositories/user.repository';
import { BuyCourseSaga } from './sagas/buy-course.saga';
import { UserEventEmitter } from './user.event-emitter';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly rmqService: RMQService,
    private readonly userEventEmitter: UserEventEmitter
  ) {}

  public async changeProfile(user: Pick<User, 'displayName'>, id: string) {
    const existingUser = await this.userRepository.findUserById(id);
    if (!existingUser) {
      throw new Error('Такого пользователя не существует');
    }

    const userEntity = new UserEntity(existingUser);
    userEntity.updateProfile(user.displayName);
    await this._updateUser(userEntity);
    return {};
  }

  public async buyCourse(courseId: string, userId: string) {
    const userEntity = await this._getUserEntity(userId);

    const saga = new BuyCourseSaga(userEntity, courseId, this.rmqService);
    const { user, paymentLink } = await saga.getState().pay();
    await this._updateUser(user);
    return { paymentLink };
  }

  public async checkPayment(courseId: string, userId: string) {
    const userEntity = await this._getUserEntity(userId);

    const saga = new BuyCourseSaga(userEntity, courseId, this.rmqService);
    const { user, status } = await saga.getState().checkPayment();
    await this._updateUser(user);
    return { status };
  }

  public async getUserInfo(id: string) {
    const user = await this.userRepository.findUserById(id);
    const profile = new UserEntity(user).getUserProfile();

    return {
      profile,
    };
  }

  async getUserCourses(id: string) {
    const user = await this.userRepository.findUserById(id);

    return {
      courses: user.courses,
    };
  }

  private async _getUserEntity(userId: string) {
    const existingUser = await this.userRepository.findUserById(userId);
    if (!existingUser) {
      throw new Error('Такого пользователя не существует');
    }
    return new UserEntity(existingUser);
  }

  private _updateUser(user: UserEntity) {
    return Promise.all([
      this.userRepository.updateUser(user),
      this.userEventEmitter.handle(user),
    ]);
  }
}
