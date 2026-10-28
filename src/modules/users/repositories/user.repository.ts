import { Types } from "mongoose";

import {
    IUser,
    UserDocument,
    UserModel
} from "../models/user.model";

import {
    IUserRepository
} from "./user.repository.interface";

export class UserRepository implements IUserRepository {

    async create(
        data: Partial<IUser>
    ): Promise<UserDocument> {

        return UserModel.create(data);
    }

    async findByEmail(
        email: string,
        includePassword = false
    ): Promise<UserDocument | null> {

        const query = UserModel.findOne({
            email
        });

        if (includePassword) {
            query.select("+password");
        }

        return query.exec();
    }

    async findById(
        id: Types.ObjectId
    ): Promise<UserDocument | null> {

        return UserModel.findById(id).exec();
    }

    async findPublicById(
        id: Types.ObjectId
    ) {

        return UserModel.findById(id)
            .select(
                "firstName lastName email isActive " +
                "isEmailVerified createdAt updatedAt"
            )
            .lean()
            .exec();
    }

    async recordFailedLogin(
        userId: Types.ObjectId,
        maxAttempts: number,
        lockDurationMs: number
    ): Promise<void> {

        const lockUntil = new Date(
            Date.now() + lockDurationMs
        );

        await UserModel.updateOne(
            {
                _id: userId
            },
            [
                {
                    $set: {
                        failedLoginAttempts: {
                            $add: [
                                { $ifNull: ["$failedLoginAttempts", 0] },
                                1
                            ]
                        }
                    }
                },
                {
                    $set: {
                        lockUntil: {
                            $cond: [
                                {
                                    $gte: [
                                        "$failedLoginAttempts",
                                        maxAttempts
                                    ]
                                },
                                lockUntil,
                                "$lockUntil"
                            ]
                        }
                    }
                }
            ]
        ).exec();
    }

    async resetFailedLoginAttempts(
        userId: Types.ObjectId
    ): Promise<void> {

        await UserModel.updateOne(
            { _id: userId },
            {
                $set: {
                    failedLoginAttempts: 0,
                    lockUntil: null
                }
            }
        ).exec();
    }

    async findByEmailForUpdate(
        email: string
    ): Promise<UserDocument | null> {

        return UserModel.findOne({ email }).exec();
    }

    async updateProfile(
        userId: Types.ObjectId,
        data: Partial<Pick<IUser, "firstName" | "lastName">>
    ): Promise<UserDocument | null> {

        return UserModel.findByIdAndUpdate(
            userId,
            { $set: data },
            {
                new: true,
                runValidators: true
            }
        ).exec();
    }
}