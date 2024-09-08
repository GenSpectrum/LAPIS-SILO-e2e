import { execSync } from 'child_process';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import * as path from 'path';
import * as fs from 'fs';
import { randomBytes } from 'node:crypto';
import { decompress } from '@mongodb-js/zstd';
import { TestCase } from './testCase.spec.js';

// A salt for docker compose project names to not conflict with previous or parallel test runs
const docker_project_salt = randomBytes(Math.ceil(2)).toString('hex').slice(0, 4);

type TestSuite = {
    path: string;
    lapisPort: number;
    siloPort: number;
    testCases: TestCase[];
};

const PORT_BASE = 8000;

const testsets: TestSuite[] = await Promise.all(
    getTestsetDirectories().map(async (dir, index): Promise<TestSuite> => {
        const lapisPort = PORT_BASE + index * 2;
        const siloPort = PORT_BASE + index * 2 + 1;

        const queriesDir = path.join(dir, 'queries');

        const testCases: TestCase[] = await Promise.all(
            fs
                .readdirSync(queriesDir)
                .filter((x) => x.endsWith('.query.ts'))
                .map(async (file) => await loadTestObject(path.join(queriesDir, file))),
        );

        return { path: dir, lapisPort, siloPort, testCases };
    }),
);

console.log(
    'These are all the testsets that were identified with their corresponding LAPIS and SILO port numbers:',
    testsets,
);

testsets.map((testSuite) => {
    const testBaseDir = path.basename(testSuite.path);
    const testName = (testBaseDir + '_' + docker_project_salt).toLowerCase();

    const dataDir = path.join(testSuite.path, 'data');
    const queriesDir = path.join(testSuite.path, 'queries');
    const outputDir = path.join(testSuite.path, 'output');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }

    const dockerComposeEnv = `LAPIS_TAG=latest SILO_TAG=latest \
        LAPIS_PORT=${testSuite.lapisPort} SILO_PORT=${testSuite.siloPort} \
        TESTSET_DATA_FOLDER=${dataDir} TESTSET_OUTPUT_FOLDER=${outputDir}`;

    function dockerComposeUp() {
        console.log(`Starting Docker Compose for ${testSuite.path}...`);

        const dockerComposeUpCommand = `${dockerComposeEnv} docker compose --project-name ${testName} --progress=plain up --no-recreate --detach --wait`;

        console.log(dockerComposeUpCommand);
        execSync(dockerComposeUpCommand, { stdio: 'inherit' });
    }

    function dockerComposeDown() {
        console.log(`Stopping Docker Compose for ${testSuite.path}...`);

        const dockerComposeDownCommand = `docker compose -p ${testName} --progress=plain down`;

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

        testSuite.testCases.forEach((test) => {
            itShouldValidateTestCase(test, queriesDir, testSuite.lapisPort);
        });
    });
});

async function itShouldValidateTestCase(testCase: TestCase, queriesDir: string, lapisPort: number) {
    it(`should validate query from ${testCase.name}`, async () => {
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

function getTestsetDirectories(): string[] {
    const testsetsPath = path.resolve(__dirname, 'testsets');
    return fs
        .readdirSync(testsetsPath)
        .filter((name) => fs.lstatSync(path.join(testsetsPath, name)).isDirectory())
        .map((name) => path.join(testsetsPath, name));
}

async function loadTestObject(filename: string): Promise<TestCase> {
    try {
        const module = await import(filename);
        return module.default; // Access the default export
    } catch (error) {
        console.error(`Failed to load module: ${filename}`, error);
        throw error;
    }
}

async function getExpectedResponseString(file: string, compressed: boolean | undefined): Promise<string> {
    if (compressed) {
        const buffer: Buffer = fs.readFileSync(file);
        const decompressedBuffer: Buffer = await decompress(buffer);
        return decompressedBuffer.toString('utf-8');
    } else {
        return fs.readFileSync(file, 'utf-8');
    }
}
