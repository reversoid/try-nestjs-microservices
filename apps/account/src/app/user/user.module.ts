import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './models/user.model';
import { UserRepository } from './repositories/user.repository';

@Module({
  imports: [MongooseModule.forFeature(
    [
      {
        name: User.name,
        schema: UserSchema,
      }
    ]
  )],
  providers: [UserService],
  exports: [UserRepository],
})
export class UserModule {}
