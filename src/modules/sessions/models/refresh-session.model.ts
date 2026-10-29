import {
    Schema,
    model,
    Types,
    HydratedDocument
} from "mongoose";

export interface IRefreshSession {
    userId: Types.ObjectId;

    familyId: string;

    refreshTokenHash: string;

    expiresAt: Date;

    revokedAt: Date | null;

    revokeReason: string | null;

    replacedByTokenHash: string | null;

    userAgent?: string;

    ipAddress?: string;

    createdAt: Date;

    updatedAt: Date;
}

export type RefreshSessionDocument =
    HydratedDocument<IRefreshSession>;

const refreshSessionSchema =
    new Schema<IRefreshSession>(
        {
            userId: {
                type: Schema.Types.ObjectId,
                ref: "User",
                required: true
            },

            familyId: {
                type: String,
                required: true
            },

            refreshTokenHash: {
                type: String,
                required: true,
                select: false
            },

            expiresAt: {
                type: Date,
                required: true
            },

            revokedAt: {
                type: Date,
                default: null
            },

            revokeReason: {
                type: String,
                default: null
            },

            replacedByTokenHash: {
                type: String,
                default: null
            },

            userAgent: String,

            ipAddress: String
        },
        {
            timestamps: true,
            versionKey: false
        }
    );

refreshSessionSchema.index(
    { refreshTokenHash: 1 },
    {
        unique: true,
        name: "uq_refresh_session_token"
    }
);

refreshSessionSchema.index(
    { userId: 1, revokedAt: 1 },
    {
        name: "ix_refresh_session_user_revoked"
    }
);

refreshSessionSchema.index(
    { familyId: 1 },
    {
        name: "ix_refresh_session_family"
    }
);

export const RefreshSessionModel =
    model<IRefreshSession>(
        "RefreshSession",
        refreshSessionSchema
    );