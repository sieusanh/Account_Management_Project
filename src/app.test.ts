import supertest from 'supertest';
import app from './app';
const request = supertest(app);

describe('POST /v1/accounts', () => {
    describe('Check valid params', () => {
        test('Miss some fields, status code 400', async () => {
            const res = await request.post('/v1/accounts').send({
                name: 'Johny '
            });
            expect(res.statusCode).toBe(400);
        });
        test('Full fields, status code 201', async () => {
            const res = await request.post('/v1/accounts').send({
                name: 'First person',
                phone: '1231123123',
                role: 'EMPLOYEE',
                username: 'Developer11',
                password: 'Abc123@dawd'
            });
            expect(res.statusCode).toBe(201);
        });
    });

})