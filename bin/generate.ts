import { SQLResult } from '../src/testCase.ts';
import { getTestSets, TestSet, getAbsoluteFileResultFromSQLResult } from '../src/testSet.ts';
import duckdb from 'duckdb';

const db = new duckdb.Database(':memory:');
db.exec("PRAGMA default_null_order='NULLS FIRST';");

db.run('CREATE TABLE my_table (id INTEGER, name VARCHAR)', (err) => {
    if (err) {
        console.error(err);
    } else {
        console.log('Table created successfully!');
    }
});

const testsets: TestSet[] = await getTestSets();

testsets.map((testSet) => {
    testSet.testCases.forEach(async (test) => {
        if (test.testCase.expectedResponse.type == 'SQLResult') {
            const resultFileToGenerate = getAbsoluteFileResultFromSQLResult(
                test.testCase.expectedResponse,
                test.testCaseFileName,
            );
            await writeFileFromSQL(test.testCase.expectedResponse, resultFileToGenerate.absoluteFilePath);
        }
    });
});

async function writeFileFromSQL(result: SQLResult, fileName: string): Promise<void> {
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
}
