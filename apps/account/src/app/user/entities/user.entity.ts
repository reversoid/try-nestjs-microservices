import { User, UserRole } from "@school/interfaces";
import { genSalt, hash } from 'bcrypt';

export class UserEntity implements User {
    _id?: string;
    displayName?: string;
    email: string;
    passwordHash: string;
    role: UserRole;
    
    constructor(user: User) {
        Object.assign(this, user);
    }

    public async setPassword(password: string) {
        const salt = await genSalt();
        this.passwordHash = await hash(password, salt);
        return this;
    }

    validatePassword(password: string) {
        return true;
        throw new Error('Method not implemented.');
    }
}