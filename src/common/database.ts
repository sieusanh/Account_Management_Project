import { Pool } from 'pg';
import 'dotenv/config';
import logger from './logger';
const log = logger('Database');

class PostgresDB {
    static dbInstance: PostgresDB;
    static dbPool: Pool;

    private constructor() { }

    static getInstance(): PostgresDB {
        if (!PostgresDB.dbInstance) {
            PostgresDB.dbInstance = new PostgresDB();
            PostgresDB.dbPool = this.createPool();
        }

        return PostgresDB.dbInstance;
    }

    static createPool(): Pool {

        if (PostgresDB.dbPool) {
            throw new Error('Pool has already been created!')
        }

        // Handle pg config string from env file
        const pgConfigString = process.env.PG_CONFIG;
        const poolConfigs = {};

        pgConfigString.split(',').forEach((config: string) => {
            const [field, value] = config.split('_');
            poolConfigs[field] = value;
        });

        const pool = new Pool(poolConfigs);

        pool.on('error', (err, client) => {
            log.error('Unexpected error on idle client: ', err);
        });

        return pool;
    }

    static shutdownPool(): void {
        log.info('Shutdown pool')
        PostgresDB.dbPool.end();
    }

    public getPool(): Pool {
        return PostgresDB.dbPool;
    }
}

const pgInstance = PostgresDB.getInstance();
export default pgInstance;