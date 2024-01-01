import jwt from 'jsonwebtoken';
import 'dotenv/config';
import { Response, NextFunction } from 'express';
import { AuthInfoRequest } from './interfaces';
import { UnauthorizedError, ForbiddenError } from './app.errors';
import { ErrorMessage } from './constants';

class BaseMiddleware {

    public userAuthentication(req: AuthInfoRequest,
        res: Response, next: NextFunction) {
        try {
            // Check if account authorized
            const author_header = req.headers?.authorization || '';

            const splitted = author_header.split(' ');
            if (!author_header || splitted.length != 2) {
                throw new UnauthorizedError(ErrorMessage.INVALID_ACCESS_TOKEN);
            }

            // Verify access token
            const accessToken = splitted[1] || '';
            const privateKey = process.env.JWT_SECRET_KEY;
            jwt.verify(accessToken, privateKey,
                (err: Error, decodedToken: jwt.JwtPayload) => {

                    // Verify failed.
                    if (err) {
                        throw new UnauthorizedError(ErrorMessage.INVALID_ACCESS_TOKEN);
                    }

                    // Verify passed.
                    const { id, username, name, role } = decodedToken;
                    req.info = { id, username, name, role };

                    next();
                })

        } catch (err) {
            throw new UnauthorizedError(ErrorMessage.INVALID_ACCESS_TOKEN);
        }
    }

    public adminAuthorization(req: AuthInfoRequest, res: Response, next: NextFunction) {

        if (req.info.role !== 'ADMIN') {
            throw new ForbiddenError(ErrorMessage.YOU_ARE_NOT_ALLOWED);
        }

        next();
    }

}

export default BaseMiddleware;