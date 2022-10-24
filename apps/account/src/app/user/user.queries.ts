import { Body, Controller } from '@nestjs/common';
import { AccountCheckPayment, AccountUserCourses, AccountUserInfo } from '@school/contracts';
import { RMQRoute, RMQValidate } from 'nestjs-rmq';
import { UserEntity } from './entities/user.entity';
import { UserRepository } from './repositories/user.repository';
import { UserService } from './user.service';
// TODO PLACE LOGIC INTO CONTROLLER
@Controller()
export class UserQueries {
  constructor(private readonly userRepository: UserRepository, private readonly userService: UserService) {}

  @RMQValidate()
  @RMQRoute(AccountUserInfo.topic)
  async userInfo(
    @Body() { id }: AccountUserInfo.Request
  ): Promise<AccountUserInfo.Response> {
    const user = await this.userRepository.findUserById(id);
    const profile = new UserEntity(user).getUserProfile();

    return {
      profile,
    };
  }

  @RMQValidate()
  @RMQRoute(AccountUserCourses.topic)
  async login(
    @Body() { id }: AccountUserCourses.Request
  ): Promise<AccountUserCourses.Response> {
    const user = await this.userRepository.findUserById(id);

    return {
      courses: user.courses,
    };
  }

  @RMQValidate()
  @RMQRoute(AccountCheckPayment.topic)
  async checkPayment(
    @Body() { courseId, userId }: AccountCheckPayment.Request
  ): Promise<AccountCheckPayment.Response> {
    return this.userService.checkPayment(courseId, userId);
  }
}
