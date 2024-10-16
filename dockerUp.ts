import * as path from 'path';
import * as fs from 'fs';
import { getTestSets, TestSet } from './testSet.ts';
import { dockerComposeUp } from './common.ts';

const testsets: TestSet[] = await getTestSets();

console.log(
    'These are all the testsets that were identified with their corresponding LAPIS and SILO port numbers:',
    testsets,
);

testsets.map((testSet) => {
    const testBaseDir = path.basename(testSet.path);
    const testName = testBaseDir.toLowerCase();

    const dataDir = path.join(testSet.path, 'data');
    const outputDir = path.join(testSet.path, 'output');
    if (fs.existsSync(outputDir)) {
        fs.rmSync(outputDir, { recursive: true, force: true });
    }
    fs.mkdirSync(outputDir);

    const dockerComposeEnv = [
        'LAPIS_TAG=latest',
        'SILO_TAG=latest',
        `LAPIS_PORT=${testSet.lapisPort}`,
        `SILO_PORT=${testSet.siloPort}`,
        `TESTSET_DATA_FOLDER=${dataDir}`,
        `TESTSET_OUTPUT_FOLDER=${outputDir}`,
    ];

    dockerComposeUp(`${testName}`, dockerComposeEnv);
});
