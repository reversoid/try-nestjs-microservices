import { User } from '@school/interfaces';
import {IsString} from 'class-validator';

export namespace AccountUserInfo {
  export const topic = 'account.user-info.query';

  export class Request {
    @IsString()
    id: string;
  }

  export class Response {
    profile: Pick<User, 'email' | 'role' | 'displayName'>;
  }
}
