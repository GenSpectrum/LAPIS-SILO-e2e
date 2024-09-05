import { execSync } from 'child_process';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import * as path from 'path';
import * as fs from 'fs';
import { randomBytes } from 'node:crypto';
import { decompress } from '@mongodb-js/zstd';

// This number is used to start the distribution of ports to all the containers that are being run
const PORT_BASE = 8000;

// A salt for docker compose project names such that they do not conflict with previous or parallel test runs
const docker_project_salt = randomBytes(Math.ceil(2)).toString('hex').slice(0, 4);

function getTestsetDirectories() {
    const testsetsPath = path.resolve(__dirname, 'testsets');
    return fs
        .readdirSync(testsetsPath)
        .filter((name) => fs.lstatSync(path.join(testsetsPath, name)).isDirectory())
        .map((name) => path.join(testsetsPath, name));
}

const testsets: [string, number, number][] = getTestsetDirectories().map((dir, index) => {
    const port1 = PORT_BASE + index * 2;
    const port2 = PORT_BASE + index * 2 + 1;
    return [dir, port1, port2];
});

console.log('All found testsets with corresponding LAPIS and SILO port numbers:', testsets);

testsets.forEach(([testsetDir, lapisPort, siloPort]) => {
    const testBaseDir = path.basename(testsetDir);
    const testName = (testBaseDir + '_' + docker_project_salt).toLowerCase();

    const dataDir = path.join(testsetDir, 'data');
    const queriesDir = path.join(testsetDir, 'queries');
    const outputDir = path.join(testsetDir, 'output');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }
    const dockerComposeEnv = `LAPIS_TAG=latest SILO_TAG=latest \
        LAPIS_PORT=${lapisPort} SILO_PORT=${siloPort} \
        TESTSET_DATA_FOLDER=${dataDir} TESTSET_OUTPUT_FOLDER=${outputDir}`;

    function dockerComposeUp() {
        console.log(`Starting Docker Compose for ${testsetDir}...`);

        const dockerComposeUpCommand = `${dockerComposeEnv} docker compose --project-name ${testName} --progress=plain up --no-recreate --detach --wait`;

        console.log(dockerComposeUpCommand);
        execSync(dockerComposeUpCommand, { stdio: 'inherit' });
    }

    function dockerComposeDown() {
        console.log(`Stopping Docker Compose for ${testsetDir}...`);

        // Add the sleep 1 because it takes some time until the port is available again.
        // This might be relevant when running vitest with auto restart
        const dockerComposeDownCommand = `docker compose -p ${testName} down && sleep 1`;

        console.log(dockerComposeDownCommand);
        execSync(dockerComposeDownCommand, { stdio: 'inherit' });
    }

    describe(`Testset: ${testName}`, () => {
        beforeAll(() => {
            dockerComposeUp();
        });

        afterAll(() => {
            dockerComposeDown();
        });

        fs.readdirSync(queriesDir).forEach((file) => {
            itShouldValidateQueryFromFile(file, queriesDir, lapisPort);
        });
    });
});

function itShouldValidateQueryFromFile(file: string, queriesDir: string, lapisPort: number) {
    if (!file.endsWith('.query.json')) {
        return;
    }
    const filePath = path.join(queriesDir, file);
    const testCase = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    it(`should validate query from ${file}`, async () => {
        if (!testCase.name || !testCase.endpoint || !testCase.method || !testCase.headers || !testCase.body) {
            expect.fail(`The query '${file}' must contain name, endpoint, method, headers and body`);
        }

        const url = `http://localhost:${lapisPort}${testCase.endpoint}`;

        const response = await fetch(url, {
            method: testCase.method,
            headers: testCase.headers,
            body: JSON.stringify(testCase.body),
        });

        const actualResponseText = await response.text();

        if (testCase.expectedStatusCode) {
            expect(response.status).to.equal(testCase.expectedStatusCode, actualResponseText);
        }
        if (testCase.expectedResponse && testCase.expectedResponse.fileName) {
            const expectedResponseFile = path.join(queriesDir, testCase.expectedResponse.fileName);
            const expectedResponseText = await getExpectedResponseString(
                expectedResponseFile,
                testCase.expectedResponse.decompressFile,
            );

            const expectedResponse = JSON.parse(expectedResponseText);
            const actualResponse = JSON.parse(actualResponseText).data;

            expect(actualResponse).to.deep.equal(expectedResponse);
        }
    });
}

async function getExpectedResponseString(file: string, compressed: boolean): Promise<string> {
    if (compressed) {
        const buffer: Buffer = fs.readFileSync(file);
        const decompressedBuffer: Buffer = await decompress(buffer);
        return decompressedBuffer.toString('utf-8');
    } else {
        return fs.readFileSync(file, 'utf-8');
    }
}
