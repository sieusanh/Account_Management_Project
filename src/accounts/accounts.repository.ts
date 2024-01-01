import AccountDTO from './accounts.dto';
import BaseRepository from '../common/base.repository';

export default class AccountRepository extends BaseRepository<AccountDTO> {
    constructor() {
        // Postgres table name
        super('accounts');
    }

    public async isUsernameExists(username: string): Promise<boolean> {
        const queryString = `
            SELECT COUNT(*)
            FROM ${this.table}
            WHERE username='${username}'
        `;
        const promise = this.pool.query(queryString, []);
        const resPromise = promise.then(({ rows = [] }) => {
            const { count } = rows[0];
            if (parseInt(count) > 0) {
                return true;
            }
            return false;
        });
        return resPromise;
    }
}