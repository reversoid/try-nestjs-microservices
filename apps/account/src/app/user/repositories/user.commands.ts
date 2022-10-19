import { Body, Controller } from '@nestjs/common';
import { AccountChangeProfile } from '@school/contracts';
import { RMQRoute, RMQValidate } from 'nestjs-rmq';
import { UserEntity } from '../entities/user.entity';
import { UserRepository } from './user.repository';

@Controller()
export class UserCommands {
  constructor(private readonly userRepository: UserRepository) {}

  @RMQValidate()
  @RMQRoute(AccountChangeProfile.topic)
  async userInfo(
    @Body() { user, id }: AccountChangeProfile.Request
  ): Promise<AccountChangeProfile.Response> {
    const existingUser = await this.userRepository.findUserById(id);
    if (!existingUser) {
      throw new Error('Такого пользователя не существует');
    }

    const userEntity = new UserEntity(existingUser);
    userEntity.updateProfile(user.displayName);
    await this.userRepository.updateUser(userEntity);
    return {};
  }
}
