import {
    Schema,
    model,
    Types,
    HydratedDocument
} from "mongoose";

export interface IEmailVerification {
    userId: Types.ObjectId;
    tokenHash: string;
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

export type EmailVerificationDocument =
    HydratedDocument<IEmailVerification>;

const emailVerificationSchema =
    new Schema<IEmailVerification>(
        {
            userId: {
                type: Schema.Types.ObjectId,
                ref: "User",
                required: true
            },

            tokenHash: {
                type: String,
                required: true,
                select: false
            },

            expiresAt: {
                type: Date,
                required: true
            }
        },
        {
            timestamps: true,
            versionKey: false
        }
    );

emailVerificationSchema.index(
    { userId: 1 },
    {
        unique: true,
        name: "uq_email_verification_user"
    }
);

emailVerificationSchema.index(
    { tokenHash: 1 },
    {
        unique: true,
        name: "uq_email_verification_token"
    }
);

emailVerificationSchema.index(
    { expiresAt: 1 },
    {
        expireAfterSeconds: 0,
        name: "ttl_email_verification"
    }
);

export const EmailVerificationModel =
    model<IEmailVerification>(
        "EmailVerification",
        emailVerificationSchema
    );