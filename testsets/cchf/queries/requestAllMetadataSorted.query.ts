import { TestCase } from '../../../testCase.ts';
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
        type: 'RelativeFileResult',
        relativeFilePath: 'requestAllMetadataSorted.json.zst',
        decompressFile: true,
    },
};
export default test;
