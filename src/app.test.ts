import supertest from 'supertest';
import app from './app';
const request = supertest(app);

describe('POST /v1/accounts', () => {
    // describe('given a username and password', () => {
    //     // should save the username and password to the database
    //     // should respond with a json object containing the user id
    //     // should respond with a 200 status code
    //     test('should respond with a 200 status code', async () => {
    //         // const response = await request.pogetst('/v1/accounts').send({
    //         //     name: 'anbc'
    //         // });
    //         const response = await request.get('/v1/accounts');
    //         expect(response.statusCode).toBe(200);
    //     })
    //     // should specify json in the content type header
    // })

    // describe('when the username and password is missing', () => {
    //     // should respond with a status code 
    // })

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