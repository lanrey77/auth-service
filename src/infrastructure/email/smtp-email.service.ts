import nodemailer from "nodemailer";

import {
    IEmailService,
    EmailMessage
} from "./email.interface";

import { env } from "../../config/env";

import { logger } from "../logger/logger";

export class SmtpEmailService implements IEmailService {

    private readonly transporter;

    constructor() {

        this.transporter = nodemailer.createTransport({
            host: env.SMTP_HOST,
            port: env.SMTP_PORT,
            secure: env.SMTP_SECURE,
            auth: {
                user: env.SMTP_USER,
                pass: env.SMTP_PASSWORD
            }
        });
    }

    async send(message: EmailMessage): Promise<void> {

        const result = await this.transporter.sendMail({
            from: env.EMAIL_FROM,
            to: message.to,
            subject: message.subject,
            html: message.html,
            text: message.text
        });

        logger.info(
            {
                messageId: result.messageId
            },
            "Email submitted to SMTP provider"
        );
    }
}