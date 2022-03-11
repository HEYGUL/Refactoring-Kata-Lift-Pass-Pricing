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

    it('does something', async () => {

        const response = await request(app)
            .get('/prices?type=1jour')

        var expectedResult = { cost: 35 }
        expect(response.body).deep.equal(expectedResult)
    });

});
