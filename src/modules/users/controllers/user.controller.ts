import {
    Request,
    Response,
    NextFunction
} from "express";

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
}