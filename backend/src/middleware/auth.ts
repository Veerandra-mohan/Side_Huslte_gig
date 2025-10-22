
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

interface DecodedToken {
  user: {
    id: string;
  };
}

// Extend the Request interface to include the user property
declare global {
  namespace Express {
    interface Request {
      user?: DecodedToken['user'];
    }
  }
}

export default function (req: Request, res: Response, next: NextFunction) {
  const token = req.header('x-auth-token');

  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
}
