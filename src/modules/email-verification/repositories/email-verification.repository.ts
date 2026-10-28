import { Types } from "mongoose";

import {
  EmailVerificationModel,
  IEmailVerification
} from "../models/email-verification.model";

export class EmailVerificationRepository {

  async replaceToken(
    userId: Types.ObjectId,
    tokenHash: string,
    expiresAt: Date
  ): Promise<void> {

    await EmailVerificationModel.updateOne(
      { userId },
      {
        $set: {
          tokenHash,
          expiresAt
        }
      },
      { upsert: true }
    ).exec();
  }

  async deleteByHash(
    tokenHash: string
  ): Promise<void> {

    await EmailVerificationModel.deleteOne({
      tokenHash
    }).exec();
  }

  async consumeToken(
    tokenHash: string,
    session: import("mongoose").ClientSession
  ): Promise<IEmailVerification | null> {

    return EmailVerificationModel.findOneAndDelete(
      {
        tokenHash,
        expiresAt: { $gt: new Date() }
      },
      { session }
    )
      .select("+tokenHash")
      .lean()
      .exec();
  }
}