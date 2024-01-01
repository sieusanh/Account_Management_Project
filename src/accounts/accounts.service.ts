import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { QueryResult } from 'pg';
import 'dotenv/config';
import AccountDTO from './accounts.dto';
import AccountRepository from './accounts.repository';
import { ErrorMessage } from '../common/constants';
import logger from '../common/logger';
import {
    BadRequestError, MissingFieldError,
    EmptyValueError, NotFoundError
} from '../common/app.errors';
import { QueryData, AuthResponse, QueryParams, AccessInfo, ID } from '../common/interfaces';
const log = logger('accounts.service');

class AccountService {
    private accountRepository: AccountRepository;

    constructor() {
        this.accountRepository = new AccountRepository();
    }

    //#region Utility methods
    private async paramsValidator(params: Partial<AccountDTO>) {

        // Check common regulations
        const insertFields = ['name', 'phone', 'role', 'username', 'password'];
        for (const [key, value] of Object.entries(params)) {

            // Check empty value
            if (!value) {
                throw new EmptyValueError(key);
            }

            // Check missing field
            const index = insertFields.indexOf(key);
            insertFields.splice(index, 1);
        }

        // Check missing field
        if (insertFields.length > 0) {
            throw new MissingFieldError(insertFields[0]);
        }

        // Preparing some variable
        const {
            name, phone, role, username, password
        } = params;
        const {
            INVALID_NAME,
            INVALID_PHONE,
            INVALID_ROLE,
            INVALID_USERNAME,
            INVALID_PASSWORD,
            USERNAME_NOT_AVAILABLE
        } = ErrorMessage;

        /**
         * Check valid name
         * 
         * Not containing any character except letter
         * Not including unicode
         */
        // 
        const namePattern = /^[a-zA-Z ]+$/;
        if (!namePattern.test(name.trim())) {
            throw new BadRequestError(INVALID_NAME);
        }

        /**
         * Check valid phone
         * 
         * Only containing numeric character
         * Length >= 8 and <= 10
         */
        const phonePattern = /^[0-9]{8,10}$/;
        if (!phonePattern.test(phone.trim())) {
            throw new BadRequestError(INVALID_PHONE);
        }

        /**
         * Check valid role
         * 
         * Only two values: EMPLOYEE | ADMIN
         */
        if (role !== 'EMPLOYEE' && role !== 'ADMIN') {
            throw new BadRequestError(INVALID_ROLE);
        }

        /**
         * Check valid username
         * Minimum 8 characters
         * Maximum 20 characters
         * NOT CONTAINING SPECIAL CHARACTERS
         * Available
         * 
         */
        const usernamePattern = /^[a-zA-Z0-9 ]{8,20}$/;
        if (!usernamePattern.test(username.trim())) {
            throw new BadRequestError(INVALID_USERNAME);
        }

        const isExists = await this.isUsernameAvailable(username);
        if (isExists) {
            throw new BadRequestError(USERNAME_NOT_AVAILABLE);
        }

        /**
         * Check valid password
         * 
         * Minimum 8 characters
         * At least one number
         * At least one non-alphabetic character
         * At least one lowercase letter
         * At least one capital letter
         */
        const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordPattern.test(password)) {
            throw new BadRequestError(INVALID_PASSWORD);
        }
    }

    private async isUsernameAvailable(username: string): Promise<boolean> {
        const isExists = await this.accountRepository.isUsernameExists(username);
        return isExists;
    }

    private async hashPassword(password: string): Promise<string> {
        const normalizedPassword = password.trim();
        const salt = await bcrypt.genSalt(5);
        const hash = await bcrypt.hash(normalizedPassword, salt);
        return hash;
    }

    private genToken(payload: Partial<AccessInfo>) {
        const expiredTime = process.env.JWT_EXPIRE_PERIOD;
        const secretKey = process.env.JWT_SECRET_KEY;

        const token = jwt.sign(
            payload,
            secretKey,
            { algorithm: 'HS256', expiresIn: expiredTime }
        );

        return token;
    }

    //#endregion

    create = async (params: Partial<AccountDTO>):
        Promise<QueryResult<AccountDTO>> => {

        log.info('create');

        // Validate params
        await this.paramsValidator(params);

        // Encrypting password before saving to database
        const { password } = params;
        const hashedPassword = await this.hashPassword(password);
        params.password = hashedPassword;

        // Calling repository
        const promise = this.accountRepository.create(params);
        return promise;
    }

    login = async (params: Partial<AccountDTO>): Promise<AuthResponse> => {
        log.info('login');
        const { username, password } = params;

        // Check if this account existed
        const { total, data } = await this.accountRepository.getAll({ username, password });
        const { INCORRECT_USERNAME, INCORRECT_PASSWORD } = ErrorMessage;
        if (total == 0) {
            throw new NotFoundError(INCORRECT_USERNAME);
        }

        const { _id, name, role, password: hashedPassword } = data[0];

        // Check password
        const isMatched = await bcrypt.compare(
            password, hashedPassword);

        if (!isMatched) {
            throw new NotFoundError(INCORRECT_PASSWORD);
        }

        // Generate new access token
        const token = this.genToken({ id: _id, name, username, role });

        return Promise.resolve({
            _id, name, username,
            role, token
        });
    }

    getAll = (filter: Partial<AccountDTO>, options?: Partial<QueryParams>):
        Promise<QueryData<AccountDTO>> => {

        log.info('getAll');

        // Calling repository
        const promise = this.accountRepository.getAll(filter, options);
        return promise;
    }

    getById = (id: ID): Promise<QueryData<AccountDTO>> => {

        log.info('getById');

        // Calling repository
        const promise = this.accountRepository.getById(id);
        return promise;
    }

    updateById = (id: ID, params: Partial<AccountDTO>):
        Promise<QueryResult<AccountDTO>> => {

        log.info('updateById');

        // Calling repository
        const promise = this.accountRepository.updateById(id, params);
        return promise;
    }

    deleteById = (id: ID): Promise<QueryResult<AccountDTO>> => {

        log.info('deleteById');

        // Calling repository
        const promise = this.accountRepository.deleteById(id);
        return promise;
    }
}

export default AccountService;