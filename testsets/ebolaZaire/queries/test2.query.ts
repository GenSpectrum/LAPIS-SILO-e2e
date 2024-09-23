import { TestCase } from '../../../testCase.ts';
const test: TestCase = {
    name: 'Query that filters for all open data',
    endpoint: '/sample/details',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: {
        dataUseTerms: 'OPEN',
        fields: ['accessionVersion', 'accession', 'dataUseTerms'],
        orderBy: [
            {
                field: 'accessionVersion',
                type: 'ascending',
            },
        ],
    },
    expectedStatusCode: 200,
    expectedResponse: {
        fileName: 'test2_result.json.zst',
        decompressFile: true,
    },
};
export default test;
