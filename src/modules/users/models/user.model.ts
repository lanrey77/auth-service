import {
  Schema,
  model,
  Types,
  HydratedDocument
} from "mongoose";

export interface IUser {
  firstName: string;
  lastName: string;
  email: string;
  password: string;

  isActive: boolean;
  isEmailVerified: boolean;

  failedLoginAttempts: number;
  lockUntil?: Date | null;

  passwordChangedAt?: Date | null;

  authorizationVersion: number;

  lastFailedLoginAt: Date | null;

  roles: Types.ObjectId[];

  createdAt: Date;
  updatedAt: Date;
}

export type UserDocument = HydratedDocument<IUser>;


const userSchema = new Schema<IUser>(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      maxlength: 254
    },

    password: {
      type: String,
      required: true,
      select: false
    },

    isActive: {
      type: Boolean,
      default: true
    },

    isEmailVerified: {
      type: Boolean,
      default: false
    },

    failedLoginAttempts: {
      type: Number,
      default: 0,
      min: 0
    },

    lockUntil: {
      type: Date,
      default: null
    },

    passwordChangedAt: {
      type: Date,
      default: null
    },

    authorizationVersion: {
      type: Number,
      default: 0,
      min: 0
    },

    lastFailedLoginAt: {
      type: Date,
      default: null
    },

    roles: [{
      type: Schema.Types.ObjectId,
      ref: "Role"
    }]
  },

  {
    timestamps: true,
    versionKey: false,
    strict: "throw"
  }
);

userSchema.index(
  { email: 1 },
  { unique: true, name: "uq_users_email" }
);

userSchema.index(
  { isActive: 1, createdAt: -1 },
  { name: "ix_users_active_created" }
);

export const UserModel = model<IUser>(
  "User",
  userSchema
);