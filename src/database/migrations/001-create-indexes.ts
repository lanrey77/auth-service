import mongoose from "mongoose";

import { connectDatabase } from "../../config/database";

import { UserModel } from "../../modules/users/models/user.model";

import {
  EmailVerificationModel
} from "../../modules/email-verification/models/email-verification.model";

import {
  RefreshSessionModel
} from "../../modules/sessions/models/refresh-session.model";

import { logger } from "../../infrastructure/logger/logger";

async function migrateIndexes(): Promise<void> {

  try {

    await connectDatabase();

    logger.info("Starting index migration");

    // Check for duplicate user emails before enforcing uniqueness.
    const duplicateEmails = await UserModel.aggregate([
      {
        $group: {
          _id: "$email",
          count: { $sum: 1 }
        }
      },
      {
        $match: {
          count: { $gt: 1 }
        }
      },
      {
        $limit: 10
      }
    ]);

    if (duplicateEmails.length > 0) {
      throw new Error(
        "Duplicate user emails exist. Resolve them before creating unique indexes."
      );
    }

    // Reconcile the legacy email_1 index from the earlier schema.
    const indexes = await UserModel.collection.indexes();

    const legacyEmailIndex = indexes.find(
      index =>
        index.name === "email_1" &&
        index.unique === true
    );

    if (legacyEmailIndex) {

      await UserModel.collection.dropIndex("email_1");

      logger.info("Removed legacy email index");
    }

    await UserModel.createIndexes();

    await EmailVerificationModel.createIndexes();

    await RefreshSessionModel.createIndexes();

    logger.info("Index migration completed successfully");

  } catch (error) {

    logger.error(
      { err: error },
      "Index migration failed"
    );

    throw error;

  } finally {

    await mongoose.disconnect();
  }
}

void migrateIndexes()
  .catch(() => {
    process.exitCode = 1;
  });