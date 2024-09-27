import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import * as path from 'path';
import * as fs from 'fs';
import { decompress } from '@mongodb-js/zstd';
import { AbsoluteFileResult, ResultFileFormat, ResultObject, SQLResult, TestCase } from './testCase.ts';
import { getTestSets, TestSet } from './testSet.ts';
import * as duckdb from 'duckdb';
import * as os from 'os';

type Context = {
    queriesDirectory: string;
    tempDirectory: string;
};

const testsets: TestSet[] = await getTestSets();

let db: duckdb.Database;

console.log(
    'These are all the testsets that were identified with their corresponding LAPIS and SILO port numbers:',
    JSON.stringify(testsets),
);

testsets.map((testSet) => {
    const testBaseDir = path.basename(testSet.path);
    const testName = testBaseDir.toLowerCase();

    const queriesDirectory = path.join(testSet.path, 'queries');
    const tempDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'lapis-silo-e2e-tmp'));

    describe(`Testset: ${testName}`, () => {
        beforeAll(() => {
            db = new duckdb.Database(':memory:');
            db.exec("PRAGMA default_null_order='NULLS FIRST';");
        });

        afterAll(() => {
            if (fs.existsSync(tempDirectory)) {
                fs.rmSync(tempDirectory, { recursive: true, force: true });
            }
        });

        testSet.testCases.forEach((test) => {
            itShouldValidateTestCase(test, { queriesDirectory, tempDirectory }, testSet.lapisPort);
        });
    });
});

function itShouldValidateTestCase(testCase: TestCase, context: Context, lapisPort: number) {
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
        if (testCase.expectedResponse) {
            const expectedResponseFileResult = await getAbsoluteFileResult(testCase.expectedResponse, context);

            const expectedResponse = await getExpectedResponseFromFile(expectedResponseFileResult);
            const actualResponse = JSON.parse(actualResponseText).data;

            expect(actualResponse).to.deep.equal(expectedResponse);
        }
    });
}

async function getAbsoluteFileResult(result: ResultObject, context: Context): Promise<AbsoluteFileResult> {
    if ('relativeFilePath' in result) {
        return {
            absoluteFilePath: path.join(context.queriesDirectory, result.relativeFilePath),
            fileFormat: 'json',
            decompressFile: result.decompressFile,
        };
    } else if ('sql' in result) {
        return await writeTmpFileFromSQL(result, context.tempDirectory);
    } else {
        return result;
    }
}

let uniqueIdGenerator: number = 0;

async function writeTmpFileFromSQL(result: SQLResult, directory: string): Promise<AbsoluteFileResult> {
    const fileName = path.join(directory, `file${uniqueIdGenerator++}.ndjson`);

    await new Promise<void>((resolve, reject) => {
        console.log(`COPY ( ${result.sql} ) TO '${fileName}' (FORMAT JSON);`);
        db.exec(`COPY ( ${result.sql} ) TO '${fileName}' (FORMAT JSON);`, (err) => {
            if (err) {
                console.log('Error when executing duckdb statement.');
                return reject(err);
            }
            resolve();
        });
    });

    return { absoluteFilePath: fileName, fileFormat: 'ndjson', decompressFile: false };
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
