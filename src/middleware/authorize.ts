import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import User from '../models/User';
import AppError from '../utils/AppError';

export const authorize = (
    ...roles: Array<'super_admin' | 'space_admin' | 'member' | 'guest'>
) => {
    return async (
        req: AuthRequest,
        _res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            if (!req.userId) {
                throw new AppError(
                    'Authentication required.',
                    401,
                    'UNAUTHENTICATED'
                );
            }

            const user = await User.findById(req.userId);

            if (!user) {
                throw new AppError(
                    'User not found.',
                    404,
                    'USER_NOT_FOUND'
                );
            }

            if (!user.isActive) {
                throw new AppError(
                    'Account is inactive.',
                    403,
                    'ACCOUNT_INACTIVE'
                );
            }

            if (!roles.includes(user.role)) {
                throw new AppError(
                    'You are not authorized to perform this action.',
                    403,
                    'FORBIDDEN'
                );
            }

            next();
        } catch (err) {
            next(err);
        }
    };
};