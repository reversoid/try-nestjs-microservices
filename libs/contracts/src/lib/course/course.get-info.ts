import { Course } from '@school/interfaces';
import { IsString } from 'class-validator';

export namespace CourseGetInfo {
  export const topic = 'course.get-info.query';

  export class Request {
    @IsString()
    id: string;
  }

  export class Response {
    course: Course | null;
  }
}
