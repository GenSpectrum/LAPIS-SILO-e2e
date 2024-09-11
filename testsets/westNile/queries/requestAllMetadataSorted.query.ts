import { TestCase } from '../../../testCase.spec.js';
const test: TestCase = {
    name: 'Query that requests all metadata and sorts it by the primary key',
    endpoint: '/sample/details',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: {
        orderBy: [
            {
                field: 'accessionVersion',
                type: 'ascending',
            },
        ],
    },
    expectedStatusCode: 200,
    expectedResponse: {
        fileName: 'requestAllMetadataSorted.json.zst',
        decompressFile: true,
    },
};
export default test;
