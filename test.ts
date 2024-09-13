import { describe, expect, it } from 'vitest';
import * as path from 'path';
import * as fs from 'fs';
import { decompress } from '@mongodb-js/zstd';
import { TestCase } from './testCase.ts';
import { getTestSets, TestSet } from './testSet.ts';

const testsets: TestSet[] = await getTestSets();

console.log(
    'These are all the testsets that were identified with their corresponding LAPIS and SILO port numbers:',
    JSON.stringify(testsets),
);

testsets.map((testSet) => {
    const testBaseDir = path.basename(testSet.path);
    const testName = testBaseDir.toLowerCase();

    const queriesDir = path.join(testSet.path, 'queries');

    describe(`Testset: ${testName}`, () => {
        testSet.testCases.forEach((test) => {
            itShouldValidateTestCase(test, queriesDir, testSet.lapisPort);
        });
    });
});

function itShouldValidateTestCase(testCase: TestCase, queriesDir: string, lapisPort: number) {
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

async function getExpectedResponseString(file: string, compressed: boolean | undefined): Promise<string> {
    if (compressed) {
        const buffer: Buffer = fs.readFileSync(file);
        const decompressedBuffer: Buffer = await decompress(buffer);
        return decompressedBuffer.toString('utf-8');
    } else {
        return fs.readFileSync(file, 'utf-8');
    }
}
