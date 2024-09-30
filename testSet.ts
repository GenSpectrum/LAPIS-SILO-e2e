import { AbsoluteFileResult, SQLResult, TestCase, ValidTestCase } from './testCase.ts';
import path from 'path';
import fs from 'fs';

export type TestSet = {
    path: string;
    lapisPort: number;
    siloPort: number;
    testCases: ValidTestCase[];
};

export async function getTestSets() {
    const directories = getTestsetDirectories();
    return await Promise.all(
        directories.map(async (dir, index): Promise<TestSet> => {
            const PORT_BASE: number = 8000;
            const lapisPort = PORT_BASE + index * 2;
            const siloPort = PORT_BASE + index * 2 + 1;

            const queriesDir = path.join(dir, 'queries');

            const testCases: ValidTestCase[] = await Promise.all(
                fs
                    .readdirSync(queriesDir)
                    .filter((x) => x.endsWith('.query.ts'))
                    .map(async (file) => await loadTestObject(path.join(queriesDir, file))),
            );

            return { path: dir, lapisPort, siloPort, testCases };
        }),
    );
}

function getTestsetDirectories(): string[] {
    const testsetsPath = path.resolve(process.cwd(), 'testsets');
    console.log('testsetsPath:', testsetsPath);
    return fs
        .readdirSync(testsetsPath)
        .filter(
            (name) =>
                fs.lstatSync(path.join(testsetsPath, name)).isDirectory() &&
                fs.readdirSync(path.join(testsetsPath, name)).some((x) => x == 'data'),
        )
        .map((name) => path.join(testsetsPath, name));
}

async function loadTestObject(filename: string): Promise<ValidTestCase> {
    try {
        const module = await import(filename);
        return validateTestCase(filename, module.default); // Access the default export
    } catch (error) {
        console.error(`Failed to load module: ${filename}`, error);
        throw error;
    }
}
function validateTestCase(testCaseFileName: string, testCase: TestCase): ValidTestCase {
    return { testCaseFileName, testCase };
}

export function getAbsoluteFileResultFromSQLResult(result: SQLResult, testCaseFileName: string): AbsoluteFileResult {
    let fileName = testCaseFileName + '.result.ndjson';
    if (result.compress) {
        fileName += '.zst';
    }
    return {
        fileFormat: 'ndjson',
        type: 'AbsoluteFileResult',
        absoluteFilePath: fileName,
        decompressFile: result.compress,
    };
}
