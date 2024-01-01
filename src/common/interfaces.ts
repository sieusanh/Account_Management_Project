import { Request } from 'express';

// Types
type AccessInfo = {
    id: number,
    name: string,
    username: string,
    role: string
}

// Interfaces
interface QueryData<T> {
    total?: number;
    data: Partial<T[]>;
}

interface ErrorObject {
    code: number;
    message: string;
}

interface RequestParams {
    limit: number
};

interface AuthInfoRequest extends Request {
    info: AccessInfo
}

interface AuthResponse {
    _id: number;
    name: string;
    username: string;
    role: string;
    token: string;
}

interface QueryParams {
    sort_by: any,
    order_by: any,
    limit: any,
    offset: any,
}

type ID = string | number;

export {
    QueryData, ErrorObject, AccessInfo,
    RequestParams, AuthInfoRequest,
    AuthResponse, QueryParams, ID,
}