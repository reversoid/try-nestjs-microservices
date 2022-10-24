import { AccountChangedCourse } from '@school/contracts';
import {
  DomainEvent,
  PurchaseState,
  User,
  UserCourses,
  UserRole,
} from '@school/interfaces';
import { compare, genSalt, hash } from 'bcrypt';

export class UserEntity implements User {
  _id?: string;
  displayName?: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  courses: UserCourses[];
  events: DomainEvent[] = [];

  constructor(user: User) {
    this._id = user._id;
    this.displayName = user.displayName;
    this.email = user.displayName;
    this.passwordHash = user.passwordHash;
    this.role = user.role;
    this.courses = user.courses ?? [];
  }

  public async setPassword(password: string) {
    const salt = await genSalt();
    this.passwordHash = await hash(password, salt);
    return this;
  }

  public getUserProfile() {
    return {
      email: this.email,
      role: this.role,
      displayName: this.displayName,
    };
  }

  async validatePassword(password: string) {
    return compare(password, this.passwordHash);
  }

  async updateProfile(displayName: string) {
    this.displayName = displayName;
    return this;
  }

  public setCourseStatus(courseId: string, state: PurchaseState) {
    const exist = this.courses.find((course) => course.courseId === courseId);

    if (!exist) {
      this._addCourse(courseId, state);
      return this;
    }

    if (state === PurchaseState.Canceled) {
      this._deleteCourse(courseId);
      return this;
    }

    const courseToUpdate = this.courses.find((c) => c.courseId === courseId);
    if (!courseToUpdate) {
      throw new Error('Данный курс не связан с пользователем');
    }
    courseToUpdate.purchaseState = state;

    this.events.push({
      topic: AccountChangedCourse.topic,
      data: {
        courseId,
        userId: this._id,
        state,
      },
    });
    return this;
  }

  private _addCourse(courseId: string, state: PurchaseState) {
    const exist = this.courses.find((course) => course.courseId === courseId);

    if (exist) {
      throw new Error('Добавляемый курс уже существует');
    }

    this.courses.push({
      courseId,
      purchaseState: state,
    });
  }

  private _deleteCourse(courseId: string) {
    this.courses = this.courses.filter((c) => c.courseId === courseId);
  }
}
