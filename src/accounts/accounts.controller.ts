import { Request, Response, NextFunction } from 'express';
import AccountDTO from './accounts.dto';
import AccountService from './accounts.service';
import logger from '../common/logger';
import { ErrorMessage } from '../common/constants';
import BaseController from '../common/base.controller';
import { ForbiddenError, MissingFieldError } from '../common/app.errors';
import { AuthInfoRequest, QueryParams, ID } from '../common/interfaces';
const log = logger('accounts.controller');

class AccountController extends BaseController {
    private accountService: AccountService;

    constructor() {
        super();
        this.accountService = new AccountService();
    }

    getAll = async (req: Request,
        res: Response): Promise<void> => {
        try {
            log.info('getAll');
            const {
                sort_by = '_id',
                order_by = 'asc',
                limit = '10',
                offset = '1',
                ...filter
            } = req.query;
            const filterParams: Partial<AccountDTO> = filter;
            const options: Partial<QueryParams> = {
                sort_by, order_by,
                limit, offset,
            };

            // Calling Service
            const response = await this.accountService.getAll(filterParams, options);

            res.status(200).json(response);
        } catch (error) {
            log.info('getAll: ', error)
        }
    }

    getById = async (req: AuthInfoRequest,
        res: Response, next: NextFunction): Promise<void> => {
        try {
            log.info('getById');
            const id: ID = req.params.id;

            if (!id) {
                throw new MissingFieldError('id');
            }

            // Check permission
            const { role, id: authId } = req.info;
            if (role !== 'ADMIN' && authId != parseInt(id)) {
                throw new ForbiddenError(ErrorMessage.YOU_ARE_NOT_ALLOWED);
            }

            // Calling Service
            const response = await this.accountService.getById(id);

            res.status(200).json(response);
        } catch (error) {
            log.error('getAll ' + error)
            next(error);
        }
    }

    create = async (req: Request, res: Response,
        next: NextFunction): Promise<void> => {
        try {
            log.info('create');

            const createAccountDto: Partial<AccountDTO> = req.body;
            await this.accountService.create(createAccountDto);
            res.sendStatus(201);
        } catch (error) {
            log.error('create ' + error)
            next(error);
        }
    }

    updateById = async (req: AuthInfoRequest,
        res: Response, next: NextFunction): Promise<void> => {
        try {
            log.info('updateById');
            const id: ID = req.params.id;
            const updateAccountDto: Partial<AccountDTO> = req.body;

            if (!id) {
                throw new MissingFieldError('id');
            }

            // Check permission
            const { role, id: authId } = req.info;
            if (role !== 'ADMIN' && authId != parseInt(id)) {
                throw new ForbiddenError(ErrorMessage.YOU_ARE_NOT_ALLOWED);
            }

            // Calling Service
            await this.accountService.updateById(id, updateAccountDto);

            res.sendStatus(204);
        } catch (error) {
            log.error('getAll ' + error)
            next(error);
        }
    }

    deleteById = async (req: AuthInfoRequest,
        res: Response, next: NextFunction): Promise<void> => {
        try {
            log.info('deleteById');
            const id: ID = req.params.id;

            if (!id) {
                throw new MissingFieldError('id');
            }

            // Check permission
            const { role, id: authId } = req.info;
            if (role !== 'ADMIN' && authId != parseInt(id)) {
                throw new ForbiddenError(ErrorMessage.YOU_ARE_NOT_ALLOWED);
            }

            // Calling Service
            await this.accountService.deleteById(id);

            res.sendStatus(204);
        } catch (error) {
            log.error('getAll ' + error)
            next(error);
        }
    }

    login = async (req: Request, res: Response,
        next: NextFunction): Promise<void> => {
        try {
            log.info('login');

            const params: Partial<AccountDTO> = req.body;
            const resData = await this.accountService.login(params);
            res.status(200).json(resData);

        } catch (error) {
            log.error('login ' + error);
            next(error);
        }
    }
}

export default AccountController;