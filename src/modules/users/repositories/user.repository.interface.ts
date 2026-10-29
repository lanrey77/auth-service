import { Types, ClientSession } from "mongoose";


import {
    IUser,
    UserDocument
} from "../models/user.model";

export interface IUserRepository {

    create(
        data: Partial<IUser>
    ): Promise<UserDocument>;

    findByEmail(
        email: string,
        includePassword?: boolean
    ): Promise<UserDocument | null>;

    findById(
        id: Types.ObjectId
    ): Promise<UserDocument | null>;

    findPublicById(
        id: Types.ObjectId
    ): Promise<Pick<
        IUser,
        "firstName" | "lastName" | "email" |
        "isActive" | "isEmailVerified" |
        "createdAt" | "updatedAt"
    > | null>;

    recordFailedLogin(
        userId: Types.ObjectId,
        maxAttempts: number
    ): Promise<void>;

    resetFailedLoginAttempts(
        userId: Types.ObjectId
    ): Promise<void>;

    findByEmailForUpdate(
        email: string
    ): Promise<UserDocument | null>;

    updateProfile(
        userId: Types.ObjectId,
        data: Partial<Pick<IUser, "firstName" | "lastName">>
    ): Promise<UserDocument | null>;


    findByIdWithPassword(
        id: Types.ObjectId,
        session?: ClientSession
    ): Promise<UserDocument | null>;

    updatePassword(
        userId: Types.ObjectId,
        currentPasswordHash: string,
        newPasswordHash: string,
        session: ClientSession
    ): Promise<boolean>;
}