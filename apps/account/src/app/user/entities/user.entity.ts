import { PurchaseState, User, UserCourses, UserRole } from '@school/interfaces';
import { compare, genSalt, hash } from 'bcrypt';

export class UserEntity implements User {
  _id?: string;
  displayName?: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  courses: UserCourses[];

  constructor(user: User) {
    Object.assign(this, user);
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

  public addCourse(courseId: string) {
    const exist = this.courses.find((course) => course.courseId === courseId);

    if (exist) {
      throw new Error('Добавляемый курс уже существует');
    }

    this.courses.push({
      courseId,
      purchaseState: PurchaseState.Started,
    });
  }

  public deleteCourse(courseId: string) {
    this.courses = this.courses.filter((c) => c.courseId === courseId);
  }

  public updateCourseStatus(courseId: string, state: PurchaseState) {
    const courseToUpdate = this.courses.find((c) => c.courseId === courseId);
    if (!courseToUpdate) {
      throw new Error('Данный курс не связан с пользователем');
    }
    courseToUpdate.purchaseState = state;
  }
}
