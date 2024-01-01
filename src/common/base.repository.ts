import { Pool, QueryResult } from 'pg';
import dbInstance from './database';
import { RepositoryCatcher } from './handler.errors';
import { QueryData, ErrorObject, QueryParams, ID } from './interfaces';

abstract class BaseRepository<T> {
    protected readonly table: string;
    protected pool: Pool

    constructor(table: string) {
        this.table = table;
        this.pool = dbInstance.getPool();
    }

    // Common filter
    genConditionString(filter: Partial<T>,
        options: Partial<QueryParams>): string {

        if (Object.keys(filter).length == 0) {
            return '';
        }

        const copyParams = { ...filter };
        const objects = Object.entries(copyParams);
        const firstKey = objects[0][0];
        const firstValue = objects[0][1];
        let filterString = `WHERE ${firstKey} = '${firstValue}' `;
        let conditionString: string = filterString;

        if (objects.length > 1) {
            // Remove the first element
            objects.splice(0, 1);

            for (const [key, value] of objects) {
                filterString += `AND ${key} = '${value}' `;
            }
        }

        if (options) {
            const { sort_by, order_by, limit,
                offset } = options;
            filterString += `AND ${sort_by} >= '${offset}'`;
            let optionString = `
                ORDER BY ${sort_by} ${order_by}
                LIMIT ${limit}
            `;

            conditionString += `\n${optionString}`;
        }

        return conditionString;
    }

    getAll = (filter: Partial<T>, options?: Partial<QueryParams>):
        Promise<QueryData<T>> => {

        const ConditionString = this.genConditionString(filter, options);
        const queryString = `
            SELECT *
            FROM ${this.table}
            ${ConditionString}
        `;
        const promise = this.pool.query(queryString, []);

        const resPromise = promise.then(({ rowCount = 0, rows = [] }) =>
            ({ total: rowCount, data: rows }));
        return resPromise;
    }

    getById = (id: ID): Promise<QueryData<T>> => {

        const queryString = `
            SELECT *
            FROM ${this.table}
            WHERE _id = '${id}'
        `;
        const promise = this.pool.query(queryString, []);

        const resPromise = promise.then(({ rows = [] }) =>
            ({ data: rows }));
        return resPromise;
    }

    updateById = (id: ID, params: Partial<T>): Promise<QueryResult<T>> => {

        let setString = '';
        for (const [key, value] of Object.entries(params)) {
            setString += `${key} = '${value}',`;
        }
        setString = setString.substring(0, setString.length - 1) + '\n';
        const queryString = `
            UPDATE ${this.table}
            SET ${setString}
            WHERE _id = '${id}'
        `;
        const promise = this.pool.query(queryString, [])
            .catch(error => {
                const { code, detail: message } = error;
                const errorObject: ErrorObject = { code: +code, message };
                throw RepositoryCatcher(errorObject);
            });
        return promise;
    }

    deleteById = (id: ID): Promise<QueryResult<T>> => {

        const queryString = `
            DELETE FROM ${this.table}
            WHERE _id = '${id}'
        `;
        const promise = this.pool.query(queryString, [])
            .catch(error => {
                const { code, detail: message } = error;
                const errorObject: ErrorObject = { code: +code, message };
                throw RepositoryCatcher(errorObject);
            });

        return promise;
    }

    create = (params: Partial<T>): Promise<QueryResult<T>> => {
        if (!params || Object.keys(params).length === 0) {
            throw new Error('Empty object provided');
        }

        // Format field string and value string 
        let i: number = 1;
        let indices: string = '';

        const fields = `${Object.keys(params).map(e => {
            indices += `$${i},`;
            i++;
            return e;
        })}`;

        const queryString = `INSERT INTO ${this.table} (${fields})
            VALUES(${indices.slice(0, indices.length - 1)})`;
        const values = Object.values(params).map(e => e);

        const promise = this.pool.query(queryString, values)
            .catch(error => {
                const { code, detail: message } = error;
                const errorObject: ErrorObject = { code: +code, message };
                throw RepositoryCatcher(errorObject);
            });
        return promise
    }
}

export default BaseRepository;