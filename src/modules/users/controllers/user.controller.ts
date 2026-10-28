import {
    Request,
    Response,
    NextFunction
} from "express";

import { z } from "zod";

import { UserService } from "../services/user.service";

import {
    registerUserSchema
} from "../dto/register-user.dto";

import {
    updateUserSchema
} from "../dto/update-user.dto";

export class UserController {

    constructor(
        private readonly userService: UserService
    ) { }

    register = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {

        try {

            const dto = registerUserSchema.parse(req.body);

            const user = await this.userService.register(dto);

            res.status(201).json({
                success: true,
                message: "Registration successful",
                data: user
            });

        } catch (error) {
            next(error);
        }
    };

    getById = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {

        try {

            const user = await this.userService.getUserById(
                req.params.id
            );

            res.status(200).json({
                success: true,
                data: user
            });

        } catch (error) {
            next(error);
        }
    };

    updateProfile = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {

        try {

            const dto = updateUserSchema.parse(req.body);

            const user = await this.userService.updateProfile(
                req.params.id,
                dto
            );

            res.status(200).json({
                success: true,
                message: "Profile updated successfully",
                data: user
            });

        } catch (error) {
            next(error);
        }
    };

    verifyEmail = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {

        try {

            const token = req.body.token;

            if (typeof token !== "string") {
                res.status(400).json({
                    success: false,
                    message: "Verification token is required"
                });
                return;
            }

            await this.userService.verifyEmail(token);

            res.status(200).json({
                success: true,
                message: "Email verified successfully"
            });

        } catch (error) {
            next(error);
        }
    };

    resendVerification = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {

        try {

            const emailSchema = z.object({
                email: z.string().email().max(254)
            });

            const { email } = emailSchema.parse(req.body);

            await this.userService.resendVerification(email);

            res.status(200).json({
                success: true,
                message:
                    "If the account requires verification, instructions will be sent."
            });

        } catch (error) {
            next(error);
        }
    };
}