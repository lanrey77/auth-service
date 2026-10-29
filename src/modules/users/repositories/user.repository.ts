import { Types, ClientSession } from "mongoose";

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
        maxAttempts: number
    ): Promise<void> {

        const baseLockDuration = 15 * 60 * 1000;

        const maximumLockDuration = 24 * 60 * 60 * 1000;

        await UserModel.updateOne(
            {
                _id: userId
            },
            [
                {
                    $set: {
                        failedLoginAttempts: {
                            $add: [
                                {
                                    $ifNull: [
                                        "$failedLoginAttempts",
                                        0
                                    ]
                                },
                                1
                            ]
                        },

                        lastFailedLoginAt: "$$NOW"
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

                                {
                                    $add: [
                                        "$$NOW",

                                        {
                                            $min: [
                                                maximumLockDuration,

                                                {
                                                    $multiply: [
                                                        baseLockDuration,

                                                        {
                                                            $pow: [
                                                                2,

                                                                {
                                                                    $floor: {
                                                                        $divide: [
                                                                            {
                                                                                $subtract: [
                                                                                    "$failedLoginAttempts",
                                                                                    maxAttempts
                                                                                ]
                                                                            },
                                                                            maxAttempts
                                                                        ]
                                                                    }
                                                                }
                                                            ]
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                },

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

    async findByIdWithPassword(
        id: Types.ObjectId,
        session?: ClientSession
    ): Promise<UserDocument | null> {

        return UserModel.findById(id)
            .select("+password")
            .session(session ?? null)
            .exec();
    }

    async updatePassword(
        userId: Types.ObjectId,
        currentPasswordHash: string,
        newPasswordHash: string,
        session: ClientSession
    ): Promise<boolean> {

        const result = await UserModel.updateOne(
            {
                _id: userId,
                password: currentPasswordHash
            },
            {
                $set: {
                    password: newPasswordHash,
                    passwordChangedAt: new Date()
                },
                $inc: {
                    authorizationVersion: 1
                }
            },
            {
                session
            }
        ).exec();

        return result.modifiedCount === 1;
    }
}