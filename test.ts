import { execSync } from 'child_process';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import * as path from 'path';
import * as fs from 'fs';
import { randomBytes } from 'node:crypto';

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

        const dockerComposeUpCommand = `${dockerComposeEnv} BUILDKIT_PROGRESS=plain docker compose --project-name ${testName} up --no-recreate --detach --wait`;

        console.log(dockerComposeUpCommand);
        execSync(dockerComposeUpCommand, { stdio: 'inherit' });
    }

    function dockerComposeDown() {
        console.log(`Stopping Docker Compose for ${testsetDir}...`);

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

        const responseText = await response.text();

        if (testCase.expectedStatusCode) {
            expect(response.status).to.equal(testCase.expectedStatusCode, responseText);
        }
        if (testCase.expectedResponse && testCase.expectedResponse.fileName) {
            const responseFile = path.join(queriesDir, testCase.expectedResponse.fileName);
            const expectedResponse = fs.readFileSync(responseFile, 'utf-8');
            const actualResponse = JSON.parse(responseText).data;

            expect(actualResponse).to.deep.equal(JSON.parse(expectedResponse));
        }
    });
}
