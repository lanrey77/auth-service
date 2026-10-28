import mongoose, { Types } from "mongoose";

import { createHash } from "crypto";

import { env } from "../../../config/env";

import { AppError } from "../../../common/errors/app-error";

import {
  generateSecureToken
} from "../../../common/utils/token.util";

import { UserRepository } from "../../users/repositories/user.repository";

import {
  EmailVerificationRepository
} from "../repositories/email-verification.repository";

import { IEmailService } from "../../../infrastructure/email/email.interface";

import { UserModel } from "../../users/models/user.model";

export class EmailVerificationService {

  constructor(
    private readonly userRepository: UserRepository,
    private readonly verificationRepository: EmailVerificationRepository,
    private readonly emailService: IEmailService
  ) { }

  async sendVerification(
    userId: Types.ObjectId,
    email: string
  ): Promise<void> {

    const { rawToken, hashedToken } =
      generateSecureToken();

    const expiresAt = new Date(
      Date.now() +
      env.EMAIL_VERIFICATION_EXPIRES_MINUTES * 60 * 1000
    );

    await this.verificationRepository.replaceToken(
      userId,
      hashedToken,
      expiresAt
    );

    const verificationUrl =
      `${env.EMAIL_VERIFICATION_URL}#token=${encodeURIComponent(rawToken)}`;

    try {

      await this.emailService.send({
        to: email,
        subject: "Verify your email address",

        html: `
          <h2>Verify your email address</h2>

          <p>Thank you for registering.</p>

          <p>Click the link below to verify your email:</p>

          <a href="${verificationUrl}">
            Verify Email
          </a>

          <p>This link expires in
          ${env.EMAIL_VERIFICATION_EXPIRES_MINUTES} minutes.</p>

          <p>If you did not create this account, ignore this email.</p>
        `,

        text: `Verify your email: ${verificationUrl}`
      });

    } catch (error) {

      // Remove only the token created by this request.
      // A concurrent resend may already have replaced it.
      await this.verificationRepository.deleteByHash(
        hashedToken
      );

      throw error;
    }
  }

  async verifyEmail(rawToken: string): Promise<void> {

    if (
      !/^[a-f0-9]{64}$/i.test(rawToken)
    ) {
      throw new AppError(
        "Invalid or expired verification link",
        400
      );
    }

    const tokenHash = createHash("sha256")
      .update(rawToken)
      .digest("hex");

    const mongoSession = await mongoose.startSession();

    try {

      await mongoSession.withTransaction(async () => {

        const verification =
          await this.verificationRepository.consumeToken(
            tokenHash,
            mongoSession
          );

        if (!verification) {
          throw new AppError(
            "Invalid or expired verification link",
            400
          );
        }

        const result = await UserModel.updateOne(
          {
            _id: verification.userId,
            isEmailVerified: false
          },
          {
            $set: {
              isEmailVerified: true
            }
          },
          {
            session: mongoSession
          }
        );

        if (result.matchedCount !== 1) {
          throw new AppError(
            "Unable to verify this account",
            400
          );
        }

      });

    } finally {

      await mongoSession.endSession();
    }
  }

  async resendVerification(email: string): Promise<void> {

    const user = await this.userRepository.findByEmail(
      email.toLowerCase().trim()
    );

    // Do not reveal whether an email address exists.
    if (!user || user.isEmailVerified || !user.isActive) {
      return;
    }

    await this.sendVerification(
      user._id,
      user.email
    );
  }
}