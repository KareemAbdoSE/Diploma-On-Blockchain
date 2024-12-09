// src/middlewares/roleMiddleware.ts

import { Request, Response, NextFunction, RequestHandler } from 'express';
import { User } from '../models/User';
import { Role } from '../models/Role';

export const authorizeRoles = (allowedRoles: string[]): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const user = await User.findByPk(userId, {
        include: [Role],
      });

      if (!user || !allowedRoles.includes(user.role.name)) {
        res.status(403).json({ message: 'Access denied.' });
        return;
      }

      next();
    } catch (error) {
      res.status(500).json({ message: 'Server error.', error });
    }
  };
};
