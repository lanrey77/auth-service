import argon2 from "argon2";
import mongoose, { Types } from "mongoose";

import { AppError } from "../../../common/errors/app-error";

import {
    IUser,
    UserDocument,
    UserModel
} from "../models/user.model";

import { IUserRepository } from "../repositories/user.repository.interface";

import { RegisterUserDto } from "../dto/register-user.dto";
import { UpdateUserDto } from "../dto/update-user.dto";

import {
    EmailVerificationService
} from "../../email-verification/services/email-verification.service";

import { logger } from "../../../infrastructure/logger/logger";

import { ChangePasswordDto } from "../dto/change-password.dto";

import { SessionRevocationService } from "../../sessions/session-revocation.service";

const LOCKOUT_MAX_ATTEMPTS = 5;

const LOCKOUT_DURATION_MS =
    15 * 60 * 1000; // 15 minutes

const ARGON2_OPTIONS = {
    type: argon2.argon2id,
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1
};

export interface PublicUser {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    isActive: boolean;
    isEmailVerified: boolean;
    createdAt: Date;
}


export class UserService {

    constructor(
        private readonly userRepository: IUserRepository,
        private readonly emailVerificationService: EmailVerificationService,
        private readonly sessionRevocationService: SessionRevocationService
    ) { }

    async register(
        dto: RegisterUserDto
    ): Promise<PublicUser> {

        const email = dto.email.toLowerCase().trim();

        const existingUser =
            await this.userRepository.findByEmail(email);

        if (existingUser) {
            throw new AppError(
                "Unable to register with these details",
                409
            );
        }

        const hashedPassword = await argon2.hash(
            dto.password,
            ARGON2_OPTIONS
        );

        try {

            const user = await this.userRepository.create({
                firstName: dto.firstName,
                lastName: dto.lastName,
                email,
                password: hashedPassword,

                isActive: true,
                isEmailVerified: false,

                failedLoginAttempts: 0,
                lockUntil: null,

                authorizationVersion: 0,

                // Never accept roles from public registration.
                roles: []
            });

            try {

                await this.emailVerificationService.sendVerification(
                    user._id,
                    user.email
                );

            } catch (error) {

                // Registration remains successful.
                // User can request another verification email.
                logger.error(
                    {
                        userId: user.id,
                        err: error
                    },
                    "Verification email delivery failed"
                );
            }

            // return user;
            return {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                isActive: user.isActive,
                isEmailVerified: user.isEmailVerified,
                createdAt: user.createdAt
            };

        } catch (error: unknown) {

            if (
                typeof error === "object" &&
                error !== null &&
                "code" in error &&
                error.code === 11000
            ) {
                throw new AppError(
                    "Unable to register with these details",
                    409
                );
            }

            throw error;
        }


    }

    async getUserById(
        userId: string
    ) {

        if (!Types.ObjectId.isValid(userId)) {
            throw new AppError("Invalid user ID", 400);
        }

        const user = await this.userRepository.findPublicById(
            new Types.ObjectId(userId)
        );

        if (!user) {
            throw new AppError("User not found", 404);
        }

        return user;
    }

    async updateProfile(
        userId: string,
        dto: UpdateUserDto
    ) {

        if (!Types.ObjectId.isValid(userId)) {
            throw new AppError("Invalid user ID", 400);
        }

        const user = await this.userRepository.updateProfile(
            new Types.ObjectId(userId),
            dto
        );

        if (!user) {
            throw new AppError("User not found", 404);
        }

        return {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email
        };
    }

    async isAccountLocked(
        user: Pick<IUser, "lockUntil">
    ): Promise<boolean> {

        if (!user.lockUntil) {
            return false;
        }

        return user.lockUntil.getTime() > Date.now();
    }


    async resetFailedLoginAttempts(
        userId: Types.ObjectId
    ): Promise<void> {

        await this.userRepository.resetFailedLoginAttempts(
            userId
        );
    }

    async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {

        return argon2.verify(
            hashedPassword,
            plainPassword
        );
    }

    async verifyEmail(token: string): Promise<void> {

        await this.emailVerificationService.verifyEmail(token);

    }

    async resendVerification(email: string): Promise<void> {

        await this.emailVerificationService.resendVerification(email);

    }

    async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {

        if (!Types.ObjectId.isValid(userId)) {
            throw new AppError("Invalid user ID", 400);
        }

        const objectId = new Types.ObjectId(userId);

        const user = await this.userRepository.findByIdWithPassword(
            objectId
        );

        if (!user) {
            throw new AppError("User not found", 404);
        }

        if (!user.isActive) {
            throw new AppError("Account is inactive", 403);
        }

        const currentPasswordValid = await argon2.verify(
            user.password,
            dto.currentPassword
        );

        if (!currentPasswordValid) {
            throw new AppError("Current password is incorrect", 400);
        }

        const samePassword = await argon2.verify(
            user.password,
            dto.newPassword
        );

        if (samePassword) {
            throw new AppError(
                "New password must be different from current password",
                400
            );
        }

        const newPasswordHash = await argon2.hash(
            dto.newPassword,
            ARGON2_OPTIONS
        );

        const session = await mongoose.startSession();

        try {

            await session.withTransaction(async () => {

                const updated =
                    await this.userRepository.updatePassword(
                        objectId,
                        user.password,
                        newPasswordHash,
                        session
                    );

                if (!updated) {
                    throw new AppError(
                        "Password was changed by another request. Please try again.",
                        409
                    );
                }

                await this.sessionRevocationService.revokeAllForUser(
                    objectId,
                    "password_changed",
                    session
                );

            });

        } finally {

            await session.endSession();
        }
    }
}