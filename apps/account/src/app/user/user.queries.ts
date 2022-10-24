import { Body, Controller } from '@nestjs/common';
import {
  AccountCheckPayment,
  AccountUserCourses,
  AccountUserInfo,
} from '@school/contracts';
import { RMQRoute, RMQValidate } from 'nestjs-rmq';
import { UserService } from './user.service';

@Controller()
export class UserQueries {
  constructor(private readonly userService: UserService) {}

  @RMQValidate()
  @RMQRoute(AccountUserInfo.topic)
  async getUserInfo(
    @Body() { id }: AccountUserInfo.Request
  ): Promise<AccountUserInfo.Response> {
    return this.userService.getUserInfo(id);
  }

  @RMQValidate()
  @RMQRoute(AccountUserCourses.topic)
  async getUserCourses(
    @Body() { id }: AccountUserCourses.Request
  ): Promise<AccountUserCourses.Response> {
    return this.userService.getUserCourses(id);
  }

  @RMQValidate()
  @RMQRoute(AccountCheckPayment.topic)
  async checkPayment(
    @Body() { courseId, userId }: AccountCheckPayment.Request
  ): Promise<AccountCheckPayment.Response> {
    return this.userService.checkPayment(courseId, userId);
  }
}
