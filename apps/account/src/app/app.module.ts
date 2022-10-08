import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { getMongoConfig } from './configs/mongo.config';

@Module({
  imports: [MongooseModule.forRootAsync(getMongoConfig()), UserModule, AuthModule, ConfigModule.forRoot({isGlobal: true, envFilePath: 'envs/.account.env'})],
})
export class AppModule {}
