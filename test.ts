import { describe, expect, it } from 'vitest';
import * as path from 'path';
import * as fs from 'fs';
import { decompress } from '@mongodb-js/zstd';
import { AbsoluteFileResult, ResultFileFormat, ValidTestCase } from './testCase.ts';
import { getTestSets, TestSet, getAbsoluteFileResultFromSQLResult } from './testSet.ts';

type Context = {
    queriesDirectory: string;
};

const testsets: TestSet[] = await getTestSets();

console.log(
    'These are all the testsets that were identified with their corresponding LAPIS and SILO port numbers:',
    JSON.stringify(testsets),
);

testsets.map((testSet) => {
    const testBaseDir = path.basename(testSet.path);
    const testName = testBaseDir.toLowerCase();

    const queriesDirectory = path.join(testSet.path, 'queries');

    describe(`Testset: ${testName}`, () => {
        testSet.testCases.forEach((test) => {
            itShouldValidateTestCase(test, { queriesDirectory }, testSet.lapisPort);
        });
    });
});

function itShouldValidateTestCase(testCaseWrapper: ValidTestCase, context: Context, lapisPort: number) {
    const testCase = testCaseWrapper.testCase;
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
        const expectedResponseFileResult = getAbsoluteFileResult(testCaseWrapper, context);

        const expectedResponse = await getExpectedResponseFromFile(expectedResponseFileResult);
        const actualResponse = JSON.parse(actualResponseText).data;

        expect(actualResponse).to.deep.equal(expectedResponse);
    });
}

function getAbsoluteFileResult(testCaseWrapper: ValidTestCase, context: Context): AbsoluteFileResult {
    const expectedResponse = testCaseWrapper.testCase.expectedResponse;
    switch (expectedResponse.type) {
        case 'RelativeFileResult':
            return {
                type: 'AbsoluteFileResult',
                absoluteFilePath: path.join(context.queriesDirectory, expectedResponse.relativeFilePath),
                fileFormat: 'json',
                decompressFile: expectedResponse.decompressFile,
            };
        case 'SQLResult':
            return getAbsoluteFileResultFromSQLResult(expectedResponse, testCaseWrapper.testCaseFileName);
        case 'AbsoluteFileResult':
            return expectedResponse;
    }
}

async function getExpectedResponseFromFile(result: AbsoluteFileResult): Promise<any> {
    if (result.decompressFile) {
        const buffer: Buffer = fs.readFileSync(result.absoluteFilePath);
        const decompressedBuffer: Buffer = await decompress(buffer);
        const responseString = decompressedBuffer.toString('utf-8');
        return parseResultFileContent(responseString, result.fileFormat);
    } else {
        const responseString = fs.readFileSync(result.absoluteFilePath, 'utf-8');
        return parseResultFileContent(responseString, result.fileFormat);
    }
}

function parseResultFileContent(fileContent: string, format: ResultFileFormat): any {
    if (format == 'json') {
        return JSON.parse(fileContent);
    }

    const lines = fileContent.split('\n').filter((line) => line.trim() !== '');
    return lines.map((line) => {
        try {
            return JSON.parse(line);
        } catch (error) {
            console.error(`Error parsing line: ${line}`, error);
            throw Error(`Error parsing line: ${line}`);
        }
    });
}
