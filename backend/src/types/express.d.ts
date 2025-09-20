import { JwtPayload } from 'jsonwebtoken';

declare module 'express' {
  interface Request {
    user?: JwtPayload & { sub: string; email: string; roles: string[] };
  }
}
