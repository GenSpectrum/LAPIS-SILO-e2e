import * as path from 'path';
import { getTestSets, TestSet } from '../src/testSet.ts';
import { dockerComposeDown } from '../src/docker.ts';

const testsets: TestSet[] = await getTestSets();

console.log(
    'These are all the testsets that were identified with their corresponding LAPIS and SILO port numbers:',
    testsets,
);

testsets.map((testSet) => {
    const testBaseDir = path.basename(testSet.path);
    const testName = testBaseDir.toLowerCase();
    dockerComposeDown(`${testName}`);
});
