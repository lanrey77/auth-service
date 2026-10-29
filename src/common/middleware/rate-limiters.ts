import rateLimit, {
    ipKeyGenerator
} from "express-rate-limit";

import { RedisStore } from "rate-limit-redis";

import { redisClient } from "../../infrastructure/redis/redis";

function createRedisStore(prefix: string) {

    return new RedisStore({
        prefix,

        sendCommand: (command, ...args) =>
            redisClient.sendCommand([
                command,
                ...args
            ])
    });
}

export const loginIpLimiter = rateLimit({

    windowMs: 15 * 60 * 1000,

    limit: 30,

    standardHeaders: "draft-8",

    legacyHeaders: false,

    store: createRedisStore("rl:login:ip:"),

    message: {
        success: false,
        message: "Too many login attempts. Try again later."
    }
});

export const loginAccountLimiter = rateLimit({

    windowMs: 15 * 60 * 1000,

    limit: 10,

    standardHeaders: "draft-8",

    legacyHeaders: false,

    keyGenerator: req => {

        const email =
            typeof req.body?.email === "string"
                ? req.body.email.trim().toLowerCase()
                : "missing";

        return `${ipKeyGenerator(req.ip ?? "")}:${email}`;
    },

    store: createRedisStore("rl:login:account:"),

    message: {
        success: false,
        message: "Too many login attempts. Try again later."
    }
});

export const verificationResendLimiter = rateLimit({

    windowMs: 60 * 60 * 1000,

    limit: 3,

    standardHeaders: "draft-8",

    legacyHeaders: false,

    store: createRedisStore("rl:verification:"),

    message: {
        success: false,
        message: "Too many verification requests."
    }
});

export const registrationLimiter = rateLimit({

    windowMs: 60 * 60 * 1000,

    limit: 5,

    standardHeaders: "draft-8",

    legacyHeaders: false,

    store: createRedisStore("rl:registration:"),

    message: {
        success: false,
        message: "Too many registration attempts."
    }
});