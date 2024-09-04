import { execSync } from 'child_process';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import * as path from 'path';
import * as fs from 'fs';
import { randomBytes } from 'node:crypto';

const PORT_BASE = 8000;

// A salt for docker compose project names such that they do not conflict with previous or parallel test runs
const docker_project_salt = randomBytes(Math.ceil(2))
    .toString('hex') // Convert bytes to hex string
    .slice(0, 4);

// Helper function to get all test set directories
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

// Iterate over each testset
testsets.forEach(([testsetDir, lapisPort, siloPort]) => {
    const testBaseDir = path.basename(testsetDir);
    const testName = (testBaseDir + '_' + docker_project_salt).toLowerCase();
    console.log(`Hello testset: ${testBaseDir} (${testName}).`);

    const dataDir = path.join(testsetDir, 'data');
    const queriesDir = path.join(testsetDir, 'queries');
    const outputDir = path.join(testsetDir, 'output');
    const dockerComposeFile = 'docker-compose.yml';

    const dockerComposeEnv = `LAPIS_TAG=latest SILO_TAG=latest \
        LAPIS_PORT=${lapisPort} SILO_PORT=${siloPort} \
        TESTSET_DATA_FOLDER=${dataDir} TESTSET_OUTPUT_FOLDER=${outputDir}`;

    describe(`Testset: ${testName}`, () => {
        beforeAll(() => {
            if (fs.existsSync(dockerComposeFile)) {
                console.log(`Starting Docker Compose for ${testsetDir}...`);

                const dockerComposeUpCommand = `${dockerComposeEnv} BUILDKIT_PROGRESS=plain docker compose -p ${testName} up --no-recreate -d --wait`;

                console.log(dockerComposeUpCommand);
                execSync(dockerComposeUpCommand, { stdio: 'inherit' });
            }
        });

        afterAll(() => {
            if (fs.existsSync(dockerComposeFile)) {
                console.log(`Stopping Docker Compose for ${testsetDir}...`);

                const dockerComposeDownCommand = `docker compose -p ${testName} down && sleep 1`;

                console.log(dockerComposeDownCommand);
                execSync(dockerComposeDownCommand, { stdio: 'inherit' });
            }
        });

        // Load and execute each test case from the queries folder
        fs.readdirSync(queriesDir).forEach((file) => {
            if (!file.endsWith('.query.json')) {
                return;
            }
            const filePath = path.join(queriesDir, file);
            const testCase = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

            it(`should validate query from ${file}`, async () => {
                if (!testCase.name || !testCase.endpoint || !testCase.method || !testCase.headers || !testCase.body) {
                    console.log(`The query '${file}' must contain name, endpoint, method, headers and body`);
                    expect(false);
                }

                const url = path.join('http://localhost:' + lapisPort, testCase.endpoint);

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
        });
    });
});
