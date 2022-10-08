import {Document} from 'mongoose';
import { User as IUser, UserRole } from '@school/interfaces';
import {Schema, Prop, SchemaFactory} from '@nestjs/mongoose';

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
}

export const UserSchema = SchemaFactory.createForClass(User);