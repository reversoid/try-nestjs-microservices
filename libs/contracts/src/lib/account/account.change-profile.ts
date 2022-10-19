import { User } from '@school/interfaces';
import {IsString} from 'class-validator';

export namespace AccountChangeProfile {
  export const topic = 'account.change-profile.command';

  export class Request {
    @IsString()
    id: string;

    @IsString()
    user: Pick<User, 'displayName'>
  }

  export class Response {}
}