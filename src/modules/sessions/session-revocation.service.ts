import {
    Types,
    ClientSession
} from "mongoose";

import { RefreshSessionModel } from "./models/refresh-session.model";

export class SessionRevocationService {

    async revokeAllForUser(
        userId: Types.ObjectId,
        reason: string,
        session?: ClientSession
    ): Promise<void> {

        await RefreshSessionModel.updateMany(
            {
                userId,
                revokedAt: null
            },
            {
                $set: {
                    revokedAt: new Date(),
                    revokeReason: reason
                }
            },
            {
                session
            }
        ).exec();
    }
}