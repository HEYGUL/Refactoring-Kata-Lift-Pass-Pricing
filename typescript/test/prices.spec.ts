import { expect } from 'chai';
import { GenericContainer } from "testcontainers";
import request from 'supertest-as-promised';
import { createApp } from "../src/prices"

describe('prices', () => {

    let app, connection, container;

    before(async () => {
        container = await new GenericContainer('mariadb:10.4')
            .withExposedPorts(3306)
            .withEnv("MYSQL_ROOT_PASSWORD", "mysql")
            .withBindMount(`${__dirname}/../../database`, "/docker-entrypoint-initdb.d")
            .start()
    });

    beforeEach(async () => {
        ({ app, connection } = await createApp({ port: container.getMappedPort(3306) }));
    });

    afterEach(function () {
        connection.close()
    });

    [
        { type: '1jour', age: undefined, cost: 35 },
        { type: '1jour', age: 5, cost: 0 },
        { type: '1jour', age: 14, cost: 25 },
        { type: '1jour', age: 65, cost: 27 },
        { type: '1jour', age: 65, cost: 27 },
        { type: '1jour', age: 42, cost: 35 },
        { type: '1jour', age: 42, cost: 23, date: new Date('2022-03-14T12:00:00') },
        { type: '1jour', age: 42, cost: 35, date: new Date('2019-02-18T12:00:00') },
        { type: 'night', age: undefined, cost: 0 },
        { type: 'night', age: 5, cost: 0 },
        { type: 'night', age: 42, cost: 19 },
        { type: 'night', age: 65, cost: 8 },
    ].forEach(({ type, age, cost, date }) => {
        it(`returns ${cost} when type is ${type} and age is ${age} and date is ${date}`, async () => {
            let query = `/prices?type=${type}`;
            query = age ? `${query}&age=${age}` : query;
            query = date ? `${query}&date=${date.toISOString()}` : query;

            const response = await request(app).get(query);

            const expectedResult = { cost }
            expect(response.body).deep.equal(expectedResult)
        });
    });

});
