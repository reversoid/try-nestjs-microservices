import {Document, Types} from 'mongoose';
import { User as IUser, UserRole, UserCourses as IUserCourses, PurchaseState } from '@school/interfaces';
import {Schema, Prop, SchemaFactory} from '@nestjs/mongoose';

@Schema()
export class UserCourses extends Document implements IUserCourses {
    @Prop({required: true})
    courseId: string;

    @Prop({required: true, enum: PurchaseState, type: String})
    purchaseState: PurchaseState;
}

export const UserCoursesSchema = SchemaFactory.createForClass(UserCourses);

@Schema()
export class User extends Document implements IUser {
    @Prop()
    displayName?: string;

    @Prop({required: true})
    email: string;

    @Prop({required: true})
    passwordHash: string;

    @Prop({required: true, enum: UserRole, type: String})
    role: UserRole;

    @Prop({type: [UserCoursesSchema], _id: false})
    courses: Types.Array<UserCourses>;
}

export const UserSchema = SchemaFactory.createForClass(User);