import { Application, Router } from 'express';
import BaseMiddleware from '../common/base.middleware';
import AccountController from './accounts.controller';

function registerRouting(app: Application): void {
    const baseMiddleware = new BaseMiddleware();
    const accountController = new AccountController();
    const router = Router();
    const routePath = `/v${process.env.API_VERSION}/accounts`;
    app.use(routePath, router);

    // Employee
    router.post('/', accountController.create);
    router.post('/login', accountController.login);
    router.get('/:id', baseMiddleware.userAuthentication,
        accountController.getById);
    router.patch('/:id', baseMiddleware.userAuthentication,
        accountController.updateById);
    router.delete('/:id', baseMiddleware.userAuthentication,
        accountController.deleteById);

    // Admin
    router.post('/admin',
        baseMiddleware.userAuthentication,
        baseMiddleware.adminAuthorization,
        accountController.create);
    router.get('/',
        baseMiddleware.userAuthentication,
        baseMiddleware.adminAuthorization,
        accountController.getAll);
    router.patch('/:id',
        baseMiddleware.userAuthentication,
        baseMiddleware.adminAuthorization,
        accountController.updateById);
    router.delete('/:id',
        baseMiddleware.userAuthentication,
        baseMiddleware.adminAuthorization,
        accountController.deleteById);
}

export default registerRouting;